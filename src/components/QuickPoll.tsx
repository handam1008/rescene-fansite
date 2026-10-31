"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quickPoll } from "@/data/quick-poll";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { FormMessage } from "./ui";

type Row = { choice: string; votes: number };

/** 브라우저마다 한 번 만들어 두는 무작위 번호 (투표 한 표의 주인). 저장소를 못 쓰면 매번 새로 만듦 */
function voterId() {
  try {
    const saved = localStorage.getItem("rescene-poll-voter");
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem("rescene-poll-voter", id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const choiceKey = `rescene-poll-${quickPoll.id}`;

/**
 * 홈 화면 원클릭 투표 (0017 SQL). 로그인 없이 누르면 바로 결과(%)가 보이고, 다시 누르면 고른 걸 바꿈.
 * 투표하기 전에는 결과를 숨겨서 남들 표에 끌려가지 않게 함
 */
export default function QuickPoll() {
  const { m, locale } = useI18n();
  const [mine, setMine] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(choiceKey);
    } catch {}
    if (!saved || !isSupabaseConfigured) return;
    setMine(saved);
    let alive = true;
    createClient()
      .rpc("quick_poll_results", { p_poll: quickPoll.id })
      .then(({ data }) => {
        if (alive && Array.isArray(data)) setRows(data.map((r) => ({ choice: r.choice, votes: Number(r.votes) })));
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!isSupabaseConfigured) return null;

  async function vote(key: string) {
    if (pending || key === mine) return;
    setPending(true);
    setError(false);
    const { data, error } = await createClient().rpc("cast_quick_vote", {
      p_poll: quickPoll.id,
      p_choice: key,
      p_voter: voterId(),
    });
    setPending(false);
    if (error || !Array.isArray(data)) {
      setError(true);
      return;
    }
    setMine(key);
    setRows(data.map((r) => ({ choice: r.choice, votes: Number(r.votes) })));
    try {
      localStorage.setItem(choiceKey, key);
    } catch {}
  }

  // 코드에 있는 보기만 셈 (예전 보기·이상한 값은 무시)
  const counts = new Map(rows?.map((r) => [r.choice, r.votes]));
  const total = quickPoll.options.reduce((sum, o) => sum + (counts.get(o.key) ?? 0), 0);
  const showResults = mine !== null && rows !== null;

  return (
    <section className="card p-5">
      <p className="text-xs font-bold text-lilac-700">🗳️ {m.poll.label}</p>
      <h2 className="mt-1 text-lg font-extrabold">{quickPoll.question[locale]}</h2>
      <p className="mt-0.5 text-xs text-ink-soft">{m.poll.hint}</p>

      <ul className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
        {quickPoll.options.map((o, i) => {
          const n = counts.get(o.key) ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const picked = mine === o.key;
          return (
            <li key={o.key} className={i === quickPoll.options.length - 1 && i % 2 === 0 ? "col-span-2 lg:col-span-1" : undefined}>
              <button
                type="button"
                onClick={() => vote(o.key)}
                disabled={pending}
                aria-pressed={picked}
                className={`relative w-full overflow-hidden border-2 px-2.5 py-2.5 text-left text-[13px] font-bold transition sm:px-3 sm:text-sm ${
                  picked ? "border-lilac-500 bg-white" : "border-lilac-200 bg-white hover:border-lilac-400"
                } disabled:opacity-70`}
              >
                {showResults && (
                  <span aria-hidden className="absolute inset-y-0 left-0 bg-lilac-100 transition-[width] duration-500" style={{ width: `${pct}%` }} />
                )}
                {/* 휴대폰은 두 칸씩이라 좁아서 보기 이름 아래 줄에 %·내 선택 표시, 넓은 화면은 한 줄 */}
                <span className="relative flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <span className="whitespace-nowrap">
                    {o.emoji} {o.label[locale]}
                  </span>
                  {(showResults || picked) && (
                    <span className="tabular-nums text-ink-soft">
                      {picked && (
                        <span className="mr-1 text-lilac-700">
                          ✓<span className="sr-only">{m.poll.mine}</span>
                        </span>
                      )}
                      {showResults && `${pct}%`}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <div role="alert" className="mt-3">
          <FormMessage error={m.poll.error} />
        </div>
      )}
      {showResults && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-ink-soft">{fmt(m.poll.count, { n: total })}</span>
          <Link href="/board" className="font-semibold text-lilac-700 hover:underline">
            {m.poll.talk}
          </Link>
        </div>
      )}
    </section>
  );
}
