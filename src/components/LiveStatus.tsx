"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { formatDateTime, formatTime } from "@/lib/format";
import { scheduleLives, splitLive, youtubeId, type LiveItem } from "@/lib/live";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EmptyState } from "./ui";

/*
 * LIVE 표시: 위쪽 줄의 LIVE 버튼, 헤더 아래 빨간 줄, /live 페이지.
 * 운영자가 넣은 라이브 링크(0014 SQL)와 일정의 live 주소를 합쳐서, 지금 시각에 맞는 것만 보여줌.
 * 시각은 방문자 브라우저 기준이라 정적 페이지 그대로 두고 여기서 계산함.
 */

const REFRESH_MS = 2 * 60_000;

// 여러 곳(위쪽 줄·헤더·/live)에서 같이 써도 DB 조회는 2분에 한 번만
let cache: { at: number; promise: Promise<LiveItem[]> } | null = null;

function fetchLiveLinks(): Promise<LiveItem[]> {
  if (cache && Date.now() - cache.at < REFRESH_MS - 5_000) return cache.promise;
  const promise = (async () => {
    if (!isSupabaseConfigured) return [];
    const { data } = await createClient()
      .from("live_links")
      .select("id, title, url, starts_at, ends_at")
      .gt("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(20);
    return (data ?? []).map((r) => ({ id: `db-${r.id}`, title: r.title, url: r.url, startsAt: r.starts_at, endsAt: r.ends_at }));
  })().catch(() => []);
  cache = { at: Date.now(), promise };
  return promise;
}

/** null: 아직 계산 전 (서버 화면과 어긋나지 않게 처음엔 아무것도 안 그림) */
function useLive() {
  const [now, setNow] = useState<number | null>(null);
  const [dbItems, setDbItems] = useState<LiveItem[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => fetchLiveLinks().then((items) => alive && setDbItems(items));
    setNow(Date.now());
    load();
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    const poll = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const all = useMemo(() => [...scheduleLives(), ...dbItems], [dbItems]);
  return now === null ? null : splitLive(all, now);
}

const isYouTube = (url: string) => youtubeId(url) !== null;

function LiveDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span className="relative flex h-2 w-2" aria-hidden>
      {pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:hidden" />}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
    </span>
  );
}

/** 헤더 바로 아래 빨간 줄: 방송 중이거나 30분 안에 시작하면 보임 */
export function LiveStrip() {
  const s = useLive();
  const { m, locale } = useI18n();
  if (!s || (s.live.length === 0 && s.soon.length === 0)) return null;

  const isLive = s.live.length > 0;
  const list = isLive ? s.live : s.soon;
  const first = list[0];

  return (
    <div className={isLive ? "bg-red-500 text-white" : "bg-ink text-white"}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 text-sm xl:px-6 wide:max-w-[1520px]">
        <span className="flex shrink-0 items-center gap-1.5 font-extrabold tracking-wider">
          <LiveDot pulse={isLive} />
          {isLive ? "LIVE" : fmt(m.live.soon, { time: formatTime(first.startsAt, locale) })}
        </span>
        <Link href="/live" className="min-w-0 flex-1 truncate font-semibold hover:underline">
          {first.title}
          {list.length > 1 && <span className="font-normal opacity-80">{fmt(m.live.more, { n: list.length - 1 })}</span>}
        </Link>
        <Link href="/live" className="shrink-0 font-bold hover:underline">
          {isLive ? m.live.watchNow : m.live.goWatch}
        </Link>
        <a
          href={first.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 text-xs text-white/85 underline hover:text-white sm:inline"
        >
          {isYouTube(first.url) ? m.live.onYoutubeShort : m.live.originalShort}
        </a>
      </div>
    </div>
  );
}

/** 위쪽 얇은 줄 오른쪽의 LIVE 버튼: 방송 중이면 빨갛게 깜빡임 */
export function LiveBadge() {
  const s = useLive();
  const { m } = useI18n();
  const isLive = !!s && s.live.length > 0;
  return (
    <Link
      href="/live"
      aria-label={isLive ? fmt(m.live.badgeAria, { n: s!.live.length }) : m.live.badgeIdleAria}
      className={`flex items-center gap-1.5 px-2 py-0.5 font-extrabold tracking-wider ${
        isLive ? "bg-red-500 text-white" : "text-ink-soft hover:bg-lilac-100 hover:text-ink"
      }`}
    >
      {isLive ? <LiveDot /> : <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink-soft/50" />}
      LIVE
    </Link>
  );
}

/** /live 페이지 본문: 지금 방송 중(바로 재생) + 곧 시작할 라이브 */
export function LiveBoard() {
  const s = useLive();
  const { m, locale } = useI18n();
  if (!s) return <div aria-hidden className="h-40" />;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <span className="flex items-center gap-1.5 bg-red-500 px-2 py-0.5 text-sm font-extrabold tracking-wider text-white">
            <LiveDot pulse={s.live.length > 0} />
            LIVE
          </span>
          {m.live.onAir}
        </h2>
        {s.live.length === 0 ? (
          <EmptyState>{m.live.none}</EmptyState>
        ) : (
          <ul className="space-y-6">
            {s.live.map((item, i) => (
              <li key={item.id} className="card p-4">
                <LivePlayer item={item} autoplay={i === 0} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {s.upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">{m.live.upcoming}</h2>
          <ul className="card divide-y divide-lilac-100">
            {s.upcoming.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <span className="font-semibold text-lilac-700 tabular-nums">{formatDateTime(item.startsAt, locale)}</span>
                <span className="min-w-0 flex-1 font-semibold">{item.title}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-soft underline hover:text-ink">
                  {m.live.preview}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** 유튜브면 이 페이지에서 바로 재생 (소리는 꺼진 채 자동 재생 — 브라우저 규칙). 막힌 영상은 유튜브로 */
function LivePlayer({ item, autoplay }: { item: LiveItem; autoplay: boolean }) {
  const id = youtubeId(item.url);
  const { m, locale } = useI18n();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold">{item.title}</p>
        <p className="text-xs text-ink-soft tabular-nums">
          {formatTime(item.startsAt, locale)} ~ {formatTime(item.endsAt, locale)}
        </p>
      </div>
      {id && (
        <div className="aspect-video w-full overflow-hidden bg-ink">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${autoplay ? "?autoplay=1&mute=1" : ""}`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
        >
          {isYouTube(item.url) ? m.live.watchOnYoutube : m.live.goLive}
        </a>
        {id && <span className="text-xs text-ink-soft">{m.live.blocked}</span>}
      </div>
    </div>
  );
}
