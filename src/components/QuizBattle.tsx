"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { BATTLE_LOBBY, buildQuiz, gradeIndex, latestMeta, newSeed, QUESTION_COUNT, SECONDS_PER_QUESTION } from "@/lib/quiz";
import { buzz, isMuted, setMuted, sfx, unlockAudio } from "@/lib/sfx";
import { createClient } from "@/lib/supabase/client";
import QuizHallOfFame from "./QuizHallOfFame";
import QuizLeaderboard from "./QuizLeaderboard";
import ShareButtons from "./ShareButtons";
import { buttonClass, inputClass } from "./ui";

/*
 * 리센느 퀴즈 배틀 (실시간 1대1). DB 없이 Supabase Realtime 만 씀.
 * - 대기실 채널: 이 화면에 있는 사람(presence)을 보여주고, "매칭 대기" 상태인 사람끼리 들어온 순서대로 둘씩 짝지음.
 *   짝 중 먼저 온 사람이 방 번호·문제 번호(seed)를 만들어 상대에게 알림.
 * - 방 채널: 두 사람이 다 들어오면 3초 뒤 동시에 시작. 각자 같은 10문제를 풀고 진행 상황·최종 점수를 주고받음.
 * 점수는 각자 화면에서 계산하는 놀이용이라 조작을 막지는 않음.
 */

const START_DELAY = 3000;
const FEEDBACK_MS = 900;
/** 이 시간 동안 사람이 없으면 AI 와 대결 */
const AI_WAIT_MS = 8000;

type Phase = "lobby" | "searching" | "matched" | "playing" | "done";
type Person = { id: string; name: string; state: "idle" | "waiting" | "playing"; since: number };
type Opponent = { id: string; name: string };
type Progress = { done: number; score: number; ms: number; finished: boolean };
type Answer = { choice: number; correct: boolean; ms: number };

const NAME_KEY = "rescene-battle-name";
const cleanName = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 12);

export default function QuizBattle() {
  const { m, locale } = useI18n();
  const b = m.battle;

  const supabase = useRef<SupabaseClient | null>(null);
  const lobby = useRef<RealtimeChannel | null>(null);
  const room = useRef<RealtimeChannel | null>(null);
  const myId = useRef("");
  const phaseRef = useRef<Phase>("lobby");
  /** 대기실 "match" 신호 처리 (채널에는 한 번만 등록하고 최신 함수를 이 ref 로 부름) */
  const onMatch = useRef<(payload: { room: string; seed: number; host: Opponent; guest: Opponent }) => void>(() => {});

  const [name, setName] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [status, setStatus] = useState<"connecting" | "ok" | "error">("connecting");
  const [phase, setPhaseState] = useState<Phase>("lobby");
  const [solo, setSolo] = useState(false);
  const [seed, setSeed] = useState(0);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  /** AI 상대와 대결 중인지 (AI 는 각자 화면에서만 움직임, 승수에는 안 셈) */
  const [vsBot, setVsBot] = useState(false);
  const botTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [searchSince, setSearchSince] = useState(0);
  const [opp, setOpp] = useState<Progress>({ done: 0, score: 0, ms: 0, finished: false });
  const [oppLeft, setOppLeft] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [qi, setQi] = useState(0);
  const [qStart, setQStart] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedback, setFeedback] = useState<Answer | null>(null);
  /** 이번 판 기록을 랭킹에 남겼는지 (한 판에 한 번만) · 남긴 뒤 랭킹 새로고침용 */
  const submitted = useRef(false);
  /** 운영자용 대전 기록을 남겼는지 (한 판에 한 번만, 비회원 포함) */
  const logged = useRef(false);
  const [lbKey, setLbKey] = useState(0);
  /** 로그인한 회원 (랭킹은 회원만). undefined = 확인 중 */
  const [me, setMe] = useState<{ id: string; nickname: string } | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [muted, setMutedState] = useState(false);
  /** 결과 소리를 이번 판에 냈는지 */
  const resultPlayed = useRef(false);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const quiz = useMemo(() => (seed ? buildQuiz(seed, locale, m) : []), [seed, locale, m]);
  const displayName = cleanName(name) || b.nicknamePlaceholder;

  const track = useCallback(
    (state: Person["state"]) => lobby.current?.track({ name: displayName, state, since: Date.now() }),
    [displayName],
  );

  // ── 대기실 연결 ──
  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
    setMutedState(isMuted());
    myId.current = crypto.randomUUID();
    const client = createClient();
    supabase.current = client;
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setMe(null);
      const { data: p } = await client.from("profiles").select("nickname").eq("id", data.user.id).maybeSingle();
      const nickname = cleanName(String(p?.nickname ?? ""));
      setMe({ id: data.user.id, nickname });
      // 이름을 따로 정한 적 없으면 닉네임으로
      setName((cur) => cur || nickname);
    });
    const ch = client.channel(BATTLE_LOBBY, { config: { presence: { key: myId.current } } });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<Omit<Person, "id">>();
      setPeople(
        Object.entries(state).flatMap(([id, metas]) => {
          const last = latestMeta(metas);
          return last ? [{ id, name: String(last.name ?? "").slice(0, 12), state: last.state, since: Number(last.since) || 0 }] : [];
        }),
      );
    });
    ch.on("broadcast", { event: "match" }, ({ payload }) => onMatch.current(payload));
    ch.subscribe((s) => {
      if (s === "SUBSCRIBED") {
        setStatus("ok");
        lobby.current = ch;
        ch.track({ name: "", state: "idle", since: Date.now() });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("error");
    });
    return () => {
      if (room.current) client.removeChannel(room.current);
      client.removeChannel(ch);
    };
  }, []);

  // 이름이 바뀌면 대기실에 보이는 이름도 바꿈. 글자마다 보내면 실시간 서버가 늦게 처리해서, 입력이 멈추고 0.8초 뒤에 한 번만
  useEffect(() => {
    if (status !== "ok" || phaseRef.current !== "lobby") return;
    const t = setTimeout(() => phaseRef.current === "lobby" && track("idle"), 800);
    return () => clearTimeout(t);
  }, [displayName, status, track]);

  const leaveRoom = useCallback(() => {
    if (room.current && supabase.current) supabase.current.removeChannel(room.current);
    room.current = null;
  }, []);

  const clearBot = useCallback(() => {
    botTimers.current.forEach(clearTimeout);
    botTimers.current = [];
  }, []);

  const resetGame = useCallback(() => {
    clearBot();
    setVsBot(false);
    submitted.current = false;
    logged.current = false;
    resultPlayed.current = false;
    setSaved(false);
    setQi(0);
    setAnswers([]);
    setFeedback(null);
    setOpp({ done: 0, score: 0, ms: 0, finished: false });
    setOppLeft(false);
    setStartAt(0);
  }, [clearBot]);

  // ── 방 입장: 두 사람이 다 들어오면 먼저 온 사람(host)이 시작 신호 ──
  const enterRoom = useCallback(
    (roomId: string, roomSeed: number, other: Opponent, host: boolean) => {
      if (!supabase.current) return;
      resetGame();
      setSolo(false);
      setSeed(roomSeed);
      setOpponent(other);
      setPhase("matched");
      // 매칭 알림: 소리 + 진동 + 다른 탭을 보고 있어도 알 수 있게 탭 제목 잠깐 바꿈
      sfx.match();
      buzz([120, 60, 120]);
      const prevTitle = document.title;
      document.title = m.battle.matchedTitle;
      setTimeout(() => {
        if (document.title === m.battle.matchedTitle) document.title = prevTitle;
      }, 4000);
      track("playing");
      const ch = supabase.current.channel(`battle-room-${roomId}`, { config: { presence: { key: myId.current } } });
      room.current = ch;
      let started = false;
      const begin = (delay: number) => {
        if (started) return;
        started = true;
        setStartAt(Date.now() + delay);
      };
      ch.on("presence", { event: "sync" }, () => {
        const ids = Object.keys(ch.presenceState());
        if (host && !started && ids.includes(other.id)) {
          ch.send({ type: "broadcast", event: "start", payload: { delay: START_DELAY } });
          begin(START_DELAY);
        }
      });
      ch.on("presence", { event: "leave" }, ({ key }) => {
        if (key === other.id) setOppLeft(true);
      });
      ch.on("broadcast", { event: "start" }, ({ payload }) => begin(Math.min(Number(payload?.delay) || START_DELAY, 5000)));
      ch.on("broadcast", { event: "progress" }, ({ payload }) =>
        setOpp({
          done: Math.min(QUESTION_COUNT, Number(payload?.done) || 0),
          score: Math.min(QUESTION_COUNT, Number(payload?.score) || 0),
          ms: Number(payload?.ms) || 0,
          finished: Boolean(payload?.finished),
        }),
      );
      ch.subscribe((s) => {
        if (s === "SUBSCRIBED") ch.track({ name: displayName });
      });
      // 6초 안에 상대가 안 들어오면 (다른 사람과 먼저 매칭된 경우 등) 다시 대기
      setTimeout(() => {
        if (!started && room.current === ch) {
          leaveRoom();
          setOpponent(null);
          setPhase("searching");
          track("waiting");
        }
      }, 6000);
    },
    [displayName, leaveRoom, resetGame, setPhase, track, m.battle.matchedTitle],
  );

  // 대기실에서 짝지어 주는 신호 받기 (내가 상대로 뽑혔고 아직 대기 중일 때만)
  useEffect(() => {
    onMatch.current = (payload) => {
      if (payload?.guest?.id !== myId.current || phaseRef.current !== "searching") return;
      enterRoom(String(payload.room), Number(payload.seed), { id: String(payload.host?.id), name: String(payload.host?.name ?? "").slice(0, 12) || b.nicknamePlaceholder }, false);
    };
  }, [enterRoom, b.nicknamePlaceholder]);

  // ── AI 상대: 기다려도 사람이 없으면. 문제당 2.5~9.5초 고민하고, 판마다 정답률 55~80% ──
  const startBot = useCallback(() => {
    resetGame();
    setSolo(false);
    setVsBot(true);
    setSeed(newSeed());
    setOpponent({ id: "bot", name: b.aiName });
    setPhase("matched");
    sfx.match();
    buzz([120, 60, 120]);
    track("playing");
    const start = Date.now() + START_DELAY;
    setStartAt(start);
    const accuracy = 0.55 + Math.random() * 0.25;
    let at = START_DELAY;
    let score = 0;
    let ms = 0;
    for (let i = 0; i < QUESTION_COUNT; i++) {
      const think = Math.min(2500 + Math.random() * 7000, SECONDS_PER_QUESTION * 1000 - 500);
      at += think;
      ms += think;
      if (Math.random() < accuracy) score++;
      const snapshot = { done: i + 1, score, ms: Math.round(ms), finished: i === QUESTION_COUNT - 1 };
      botTimers.current.push(setTimeout(() => setOpp(snapshot), at));
      at += FEEDBACK_MS;
    }
  }, [resetGame, setPhase, track, b.aiName]);

  useEffect(() => {
    if (phase !== "searching") return;
    const t = setTimeout(() => {
      if (phaseRef.current === "searching") startBot();
    }, AI_WAIT_MS);
    return () => clearTimeout(t);
  }, [phase, searchSince, startBot]);

  // 대기 중일 때: 대기열에서 내 짝이 생기면 (내가 먼저 온 쪽이면) 방을 만듦
  const waiting = useMemo(
    () => people.filter((p) => p.state === "waiting").sort((a, c) => a.since - c.since || a.id.localeCompare(c.id)),
    [people],
  );
  useEffect(() => {
    if (phase !== "searching" || !lobby.current) return;
    const idx = waiting.findIndex((p) => p.id === myId.current);
    if (idx < 0 || idx % 2 === 1 || !waiting[idx + 1]) return;
    const other = waiting[idx + 1];
    const roomId = `${myId.current.slice(0, 8)}${other.id.slice(0, 8)}${Date.now().toString(36)}`;
    const roomSeed = newSeed();
    lobby.current.send({
      type: "broadcast",
      event: "match",
      payload: { room: roomId, seed: roomSeed, host: { id: myId.current, name: displayName }, guest: { id: other.id, name: other.name } },
    });
    enterRoom(roomId, roomSeed, { id: other.id, name: other.name || b.nicknamePlaceholder }, true);
  }, [phase, waiting, displayName, enterRoom, b.nicknamePlaceholder]);

  // ── 시계 (카운트다운·문제 타이머) ──
  useEffect(() => {
    if (phase !== "matched" && phase !== "playing" && phase !== "searching") return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "matched" && startAt && now >= startAt) {
      sfx.go();
      setPhase("playing");
      setQStart(Date.now());
    }
  }, [phase, startAt, now, setPhase]);

  // 카운트다운 3·2·1 마다 째깍
  const countdown = phase === "matched" && startAt ? Math.max(0, Math.ceil((startAt - now) / 1000)) : null;
  const lastTick = useRef<number | null>(null);
  useEffect(() => {
    if (countdown !== null && countdown > 0 && countdown !== lastTick.current) sfx.tick();
    lastTick.current = countdown;
  }, [countdown]);

  const score = answers.filter((a) => a.correct).length;
  const totalMs = answers.reduce((s, a) => s + a.ms, 0);

  const answer = useCallback(
    (choice: number) => {
      if (phaseRef.current !== "playing" || feedback || !quiz[qi]) return;
      const a: Answer = { choice, correct: choice === quiz[qi].answer, ms: Math.min(Date.now() - qStart, SECONDS_PER_QUESTION * 1000) };
      const next = [...answers, a];
      setAnswers(next);
      setFeedback(a);
      if (a.correct) {
        sfx.correct();
        // 바로 앞까지 연속으로 맞혔으면 한 음 더
        if (answers.length > 0 && answers[answers.length - 1].correct) sfx.combo();
        buzz(30);
      } else {
        sfx.wrong();
        buzz([60, 40, 60]);
      }
      const finished = next.length === quiz.length;
      room.current?.send({
        type: "broadcast",
        event: "progress",
        payload: { done: next.length, score: next.filter((x) => x.correct).length, ms: next.reduce((s, x) => s + x.ms, 0), finished },
      });
      setTimeout(() => {
        setFeedback(null);
        if (finished) setPhase("done");
        else {
          setQi((i) => i + 1);
          setQStart(Date.now());
        }
      }, FEEDBACK_MS);
    },
    [feedback, quiz, qi, qStart, answers, setPhase],
  );

  // 랭킹에 기록 남기기: 혼자 풀기는 다 풀었을 때, 대결은 승부가 났을 때 (상대가 끝냈거나 나갔을 때)
  const submitScore = useCallback(
    (won: boolean | null) => {
      if (submitted.current || answers.length < QUESTION_COUNT || !me) return;
      submitted.current = true;
      createClient()
        .rpc("submit_quiz_score", { p_score: score, p_ms: totalMs, p_mode: solo ? "solo" : "duel", p_won: won })
        .then(({ error }) => {
          if (!error) setSaved(true);
          setLbKey((k) => k + 1);
        });
    },
    [answers.length, me, score, totalMs, solo],
  );
  // 운영자 화면용 대전 기록 (0021 SQL). 비회원도 남김
  const logGame = useCallback(
    (result: "win" | "lose" | "draw" | "forfeit" | "unknown" | null) => {
      if (logged.current || answers.length < QUESTION_COUNT) return;
      logged.current = true;
      createClient()
        .rpc("log_quiz_game", {
          p_name: displayName,
          p_mode: solo ? "solo" : "duel",
          p_score: score,
          p_ms: totalMs,
          p_opponent: solo ? null : vsBot ? "🤖 AI" : (opponent?.name ?? null),
          p_opponent_score: solo || !opp.finished ? null : opp.score,
          p_result: solo ? null : result,
          p_locale: locale,
        })
        .then(() => {});
    },
    [answers.length, displayName, solo, score, totalMs, opponent, opp, locale, vsBot],
  );
  const finishRecords = useCallback(
    (result: "win" | "lose" | "draw" | "forfeit" | "unknown" | null) => {
      logGame(result);
      // AI 와 한 판은 점수는 남기되 승수에는 안 셈
      submitScore(vsBot || result === null || result === "unknown" ? null : result === "win" || result === "forfeit");
    },
    [logGame, submitScore, vsBot],
  );
  useEffect(() => {
    if (phase !== "done") return;
    if (solo) finishRecords(null);
    else if (opp.finished) {
      const result = score > opp.score || (score === opp.score && totalMs < opp.ms) ? "win" : score === opp.score && totalMs === opp.ms ? "draw" : "lose";
      finishRecords(result);
    } else if (oppLeft) finishRecords("forfeit");
  }, [phase, solo, opp, oppLeft, score, totalMs, finishRecords]);

  // 시간 초과
  const remaining = Math.max(0, SECONDS_PER_QUESTION - (now - qStart) / 1000);
  useEffect(() => {
    if (phase === "playing" && !feedback && qStart && remaining <= 0) answer(-1);
  }, [phase, feedback, qStart, remaining, answer]);

  // 남은 시간 3·2·1초 째깍
  const secLeft = Math.ceil(remaining);
  const lastHurry = useRef(0);
  useEffect(() => {
    if (phase === "playing" && !feedback && secLeft <= 3 && secLeft > 0 && secLeft !== lastHurry.current) sfx.hurry();
    lastHurry.current = secLeft;
  }, [phase, feedback, secLeft]);

  // 연속 정답 수 (마지막부터 세어서)
  let streak = 0;
  for (let i = answers.length - 1; i >= 0 && answers[i].correct; i--) streak++;

  // 결과 소리 (한 판에 한 번)
  const outcome: "win" | "lose" | "draw" | null =
    phase !== "done"
      ? null
      : solo
        ? score >= 7
          ? "win"
          : "draw"
        : opp.finished
          ? score > opp.score || (score === opp.score && totalMs < opp.ms)
            ? "win"
            : score === opp.score && totalMs === opp.ms
              ? "draw"
              : "lose"
          : oppLeft
            ? "win"
            : null;
  useEffect(() => {
    if (!outcome || resultPlayed.current) return;
    resultPlayed.current = true;
    if (outcome === "win") sfx.win();
    else if (outcome === "lose") sfx.lose();
    else sfx.correct();
  }, [outcome]);

  // ── 버튼 ──
  function saveName(v: string) {
    setName(v);
    try {
      localStorage.setItem(NAME_KEY, cleanName(v));
    } catch {}
  }
  function toggleSound() {
    unlockAudio();
    setMuted(!muted);
    setMutedState(!muted);
  }
  function findMatch() {
    unlockAudio();
    if (phaseRef.current === "done") finishRecords(solo ? null : "unknown");
    leaveRoom();
    resetGame();
    setOpponent(null);
    setSolo(false);
    setSearchSince(Date.now());
    setNow(Date.now());
    setPhase("searching");
    track("waiting");
  }
  function cancel() {
    setPhase("lobby");
    track("idle");
  }
  function playSolo() {
    unlockAudio();
    if (phaseRef.current === "done") finishRecords(solo ? null : "unknown");
    leaveRoom();
    resetGame();
    setOpponent(null);
    setSolo(true);
    setSeed(newSeed());
    setPhase("playing");
    setQStart(Date.now());
    setNow(Date.now());
    track("idle");
  }
  function backToLobby() {
    if (phaseRef.current === "done") finishRecords(solo ? null : "unknown");
    clearBot();
    leaveRoom();
    setOpponent(null);
    setPhase("lobby");
    track("idle");
  }

  const card = "card p-5";
  const soundButton = (
    <button type="button" onClick={toggleSound} aria-pressed={!muted} className="shrink-0 border border-lilac-200 bg-white px-2 py-1 text-xs font-semibold text-ink-soft hover:border-lilac-400">
      {muted ? b.soundOff : b.soundOn}
    </button>
  );
  /** 정답·승리 때 터지는 조각 (멤버 색) */
  const burst = (count: number, spread: number) => (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = spread * (0.6 + ((i * 37) % 10) / 25);
        return (
          <span
            key={i}
            className="animate-battle-burst absolute h-2 w-2"
            style={
              {
                backgroundColor: ["#c4b5fd", "#f9a8d4", "#a5f3fc", "#a7f3d0", "#ffd59e"][i % 5],
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
  const sec = (ms: number) => (ms / 1000).toFixed(1);

  // ── 화면 ──
  if (phase === "lobby" || phase === "searching") {
    const others = people.length;
    return (
      <div className="space-y-4">
        <section className={card}>
          <div className="mb-2 flex justify-end">{soundButton}</div>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">{b.nickname}</span>
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              maxLength={12}
              placeholder={b.nicknamePlaceholder}
              disabled={phase === "searching"}
              className={inputClass}
            />
          </label>
          <p className="mt-3 text-xs text-ink-soft">{b.rules}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {phase === "lobby" ? (
              <button type="button" onClick={findMatch} disabled={status !== "ok"} className={buttonClass}>
                {b.findMatch}
              </button>
            ) : (
              <button type="button" onClick={cancel} className="border-2 border-lilac-300 bg-white px-4 py-2 text-sm font-bold text-lilac-700">
                {b.cancel}
              </button>
            )}
            <button type="button" onClick={playSolo} className="border-2 border-lilac-200 bg-white px-4 py-2 text-sm font-bold text-ink-soft hover:border-lilac-400">
              {b.solo}
            </button>
          </div>
          {phase === "searching" && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-lilac-700">
              <span className="inline-block h-2.5 w-2.5 animate-pulse bg-lilac-500" aria-hidden />
              {fmt(b.aiSearching, { n: Math.max(0, Math.ceil((searchSince + AI_WAIT_MS - now) / 1000)) })}
            </p>
          )}
          {status === "connecting" && <p className="mt-3 text-sm text-ink-soft">{b.connecting}</p>}
          {status === "error" && <p className="mt-3 text-sm font-semibold text-red-600">{b.connectError}</p>}
        </section>

        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">⏳ {b.waitingTitle} · {waiting.length}</h2>
            {status === "ok" && <span className="text-xs text-ink-soft">{fmt(b.online, { n: others })}</span>}
          </div>
          {waiting.length === 0 && <p className="mt-3 text-sm text-ink-soft">{b.waitingEmpty}</p>}
          <ul className="mt-3 flex flex-wrap gap-2">
              {waiting.map((p) => (
                <li key={p.id} className={`border-2 px-3 py-1.5 text-sm font-semibold ${p.id === myId.current ? "border-lilac-500 bg-lilac-50 text-lilac-700" : "border-lilac-200 bg-white"}`}>
                  {p.name || b.nicknamePlaceholder}
                  {p.id === myId.current && <span className="ml-1 text-xs">({b.you})</span>}
                </li>
              ))}
              <li className="border-2 border-dashed border-lilac-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft">
                {b.aiName} <span className="text-xs">· {b.aiAlways}</span>
              </li>
            </ul>
        </section>

        <QuizLeaderboard refreshKey={lbKey} myUserId={me?.id} />
        <QuizHallOfFame refreshKey={lbKey} myUserId={me?.id} />
      </div>
    );
  }

  if (phase === "matched") {
    return (
      <section className={`${card} py-10 text-center`}>
        <p className="animate-battle-pop text-xl font-extrabold">{fmt(b.matched, { name: opponent?.name ?? "" })}</p>
        <p className="mt-4 flex items-center justify-center gap-3 text-lg font-bold">
          <span className="max-w-[40%] truncate">{displayName}</span>
          <span className="text-blush-400">VS</span>
          <span className="max-w-[40%] truncate">{opponent?.name}</span>
        </p>
        {countdown !== null && countdown > 0 ? (
          <p key={countdown} className="animate-battle-pop mt-6 text-7xl font-extrabold text-lilac-500 tabular-nums">
            {countdown}
          </p>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">{b.connecting}</p>
        )}
      </section>
    );
  }

  const oppBar =
    !solo && opponent ? (
      <div className="flex items-center justify-between gap-3 border border-lilac-200 bg-white px-3 py-2 text-sm">
        <span className="font-semibold">⚔️ {opponent.name}</span>
        <span className="text-xs text-ink-soft tabular-nums">
          {oppLeft ? fmt(b.opponentLeft, { name: opponent.name }) : fmt(b.opponentProgress, { done: opp.done, score: opp.score })}
        </span>
      </div>
    ) : null;

  if (phase === "playing" && quiz[qi]) {
    const q = quiz[qi];
    return (
      <div className="space-y-3">
        {oppBar}
        <section className={`${card} ${feedback && !feedback.correct ? "animate-battle-shake" : ""}`}>
          <div className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span className="text-lilac-700">{fmt(b.question, { n: qi + 1 })}</span>
            <span className="flex items-center gap-2">
              {soundButton}
              <span className={`tabular-nums ${remaining < 5 ? "text-red-600" : "text-ink-soft"}`}>{Math.ceil(remaining)}s</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-lilac-100" aria-hidden>
            <div className="h-full bg-lilac-500 transition-[width] duration-200" style={{ width: `${(remaining / SECONDS_PER_QUESTION) * 100}%` }} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold">{q.text}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const show = feedback !== null;
              const isAnswer = i === q.answer;
              const chosen = feedback?.choice === i;
              return (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => answer(i)}
                    disabled={show}
                    className={`relative w-full border-2 px-4 py-3 text-left text-sm font-bold ${
                      show && isAnswer && chosen
                        ? "animate-battle-glow border-emerald-500 bg-mint-dream-100"
                        : show && isAnswer
                        ? "border-emerald-500 bg-mint-dream-100"
                        : show && chosen
                          ? "border-blush-400 bg-blush-100"
                          : "border-lilac-200 bg-white hover:border-lilac-400"
                    }`}
                  >
                    {o}
                    {show && isAnswer && chosen && (
                      <>
                        {burst(12, 70)}
                        <span aria-hidden className="animate-battle-float absolute top-1 right-3 text-base font-extrabold text-emerald-600">
                          +1
                        </span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 h-5 text-sm font-bold" aria-live="polite">
            {feedback &&
              (feedback.correct ? (
                <span className="animate-battle-pop inline-block text-emerald-700">
                  {b.correct}
                  {streak >= 2 && <span className="ml-2 text-lilac-700">{fmt(b.combo, { n: streak })}</span>}
                </span>
              ) : (
                <span className="text-blush-400">{feedback.choice < 0 ? b.timeUp : fmt(b.wrong, { answer: q.options[q.answer] })}</span>
              ))}
          </p>
        </section>
      </div>
    );
  }

  // ── 결과 ──
  const grade = b.grade[gradeIndex(score)];
  let verdict = "";
  if (!solo && opponent) {
    if (opp.finished) verdict = score > opp.score || (score === opp.score && totalMs < opp.ms) ? b.win : score === opp.score && totalMs === opp.ms ? b.draw : b.lose;
    else if (oppLeft) verdict = b.forfeit;
  }
  return (
    <div className="space-y-3">
      <section className={`${card} relative overflow-hidden text-center`}>
        {outcome === "win" && burst(28, 180)}
        <p className="text-sm font-semibold text-lilac-700">{solo ? b.soloResult : b.resultTitle}</p>
        {verdict ? <p className="animate-battle-pop mt-2 text-2xl font-extrabold">{verdict}</p> : null}
        {!solo && opponent && !opp.finished && !oppLeft && (
          <p className="mt-2 text-sm text-ink-soft">{fmt(b.waitingOpponent, { name: opponent.name, done: opp.done })}</p>
        )}
        <div className={`mt-4 grid gap-3 ${!solo && opponent ? "grid-cols-2" : ""}`}>
          <div className="border-2 border-lilac-300 bg-lilac-50 p-3">
            <p className="text-xs font-semibold text-ink-soft">{b.me} · {displayName}</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{fmt(b.scoreLine, { score, sec: sec(totalMs) })}</p>
          </div>
          {!solo && opponent && (
            <div className="border-2 border-lilac-100 bg-white p-3">
              <p className="text-xs font-semibold text-ink-soft">{opponent.name}</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums">
                {opp.finished ? fmt(b.scoreLine, { score: opp.score, sec: sec(opp.ms) }) : `${opp.done}/10…`}
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm font-bold text-lilac-700">{grade}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={solo ? playSolo : findMatch} className={buttonClass}>
            {solo ? b.soloAgain : b.again}
          </button>
          <button type="button" onClick={backToLobby} className="border-2 border-lilac-200 bg-white px-4 py-2 text-sm font-bold text-ink-soft">
            {b.backToLobby}
          </button>
        </div>
        {me === null ? (
          <p className="mt-3 text-sm text-ink-soft">
            {b.lbLogin}{" "}
            <Link href="/login?next=/battle" className="font-semibold text-lilac-700 underline">
              {b.lbLoginLink}
            </Link>
          </p>
        ) : (
          saved && <p className="mt-3 text-sm font-semibold text-emerald-700">✓ {b.lbSaved}</p>
        )}
        <ShareButtons text={fmt(b.shareText, { score })} path="/battle" className="mt-4 justify-center" />
      </section>

      <QuizLeaderboard refreshKey={lbKey} myUserId={me?.id} />
        <QuizHallOfFame refreshKey={lbKey} myUserId={me?.id} />
    </div>
  );
}
