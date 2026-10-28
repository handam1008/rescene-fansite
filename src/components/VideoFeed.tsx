"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Video, VideoKind } from "@/lib/videos";
import { EmptyState } from "./ui";

/*
 * 영상 목록 + 사이트 안에서 바로 재생하는 창.
 * 썸네일은 유튜브 이미지를 그대로 씀 (사이트 이미지 변환 한도를 쓰지 않게 unoptimized)
 */

const PAGE = 24;

const viewsFmt = new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 });
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(iso));

function ago(iso: string, now: number) {
  const min = Math.floor((now - Date.parse(iso)) / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  if (min < 60 * 24 * 7) return `${Math.floor(min / 1440)}일 전`;
  return shortDate(iso);
}

/** 시간 표시는 화면이 뜬 뒤 방문자 시계로 (서버에서 만든 화면과 어긋나지 않게 처음엔 날짜) */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  return now;
}

const thumb = (v: Video) => `https://i.ytimg.com/vi/${v.id}/${v.short ? "hqdefault" : "mqdefault"}.jpg`;
const watchUrl = (v: Video) => (v.short ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);

function VideoCard({ v, now, onPlay }: { v: Video; now: number | null; onPlay: (v: Video) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onPlay(v)} className="group block w-full text-left hover:transform-none">
        <span className={`relative block overflow-hidden bg-ink/10 ${v.short ? "aspect-[9/16]" : "aspect-video"}`}>
          <Image
            src={thumb(v)}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 240px, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {v.kind === "official" && (
            <span className="absolute top-1.5 left-1.5 bg-lilac-500 px-1.5 py-0.5 text-[10px] font-bold text-white">오피셜</span>
          )}
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-ink/0 text-3xl text-white opacity-0 transition group-hover:bg-ink/25 group-hover:opacity-100"
          >
            ▶
          </span>
        </span>
        <span className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold group-hover:text-lilac-700">{v.title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-soft">
          {v.channel} · {now ? ago(v.published, now) : shortDate(v.published)}
          {v.views > 0 && ` · 조회 ${viewsFmt.format(v.views)}`}
        </span>
      </button>
    </li>
  );
}

/** 누르면 뜨는 재생 창. Esc·바깥 누르기·닫기 버튼으로 닫힘 */
function PlayerModal({ v, onClose }: { v: Video; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={v.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full bg-white ${v.short ? "max-w-sm" : "max-w-4xl"}`}>
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="line-clamp-2 font-bold">{v.title}</p>
            <p className="text-xs text-ink-soft">{v.channel}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="shrink-0 px-2 text-xl leading-none text-ink-soft hover:text-ink">
            ✕
          </button>
        </div>
        <div className={`w-full bg-ink ${v.short ? "aspect-[9/16] max-h-[70vh]" : "aspect-video"}`}>
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="flex justify-end px-4 py-2.5 text-sm">
          <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer" className="font-semibold text-lilac-700 underline">
            유튜브에서 보기 ↗
          </a>
        </div>
      </div>
    </div>
  );
}

/** 영상 카드 목록 (홈의 "최신 영상"에서도 씀) */
export function VideoGrid({ videos, shorts = false }: { videos: Video[]; shorts?: boolean }) {
  const [playing, setPlaying] = useState<Video | null>(null);
  const now = useNow();
  return (
    <>
      <ul
        className={`grid gap-x-3 gap-y-5 ${
          shorts ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {videos.map((v) => (
          <VideoCard key={v.id} v={v} now={now} onPlay={setPlaying} />
        ))}
      </ul>
      {playing && <PlayerModal v={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}

const chip = (on: boolean) =>
  `shrink-0 border px-3 py-1 text-sm ${on ? "border-lilac-500 bg-lilac-500 font-semibold text-white" : "border-lilac-200 bg-white hover:bg-lilac-100"}`;

/** /videos 본문: 영상·쇼츠, 전체·오피셜·팬튜브, 채널별 */
export default function VideoFeed({ videos, channels }: { videos: Video[]; channels: { channel_id: string; name: string; kind: VideoKind }[] }) {
  const [format, setFormat] = useState<"long" | "short">("long");
  const [kind, setKind] = useState<"all" | VideoKind>("all");
  const [channel, setChannel] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);

  const list = useMemo(
    () =>
      videos.filter(
        (v) =>
          v.short === (format === "short") &&
          (kind === "all" || v.kind === kind) &&
          (!channel || v.channelId === channel),
      ),
    [videos, format, kind, channel],
  );
  const chips = channels.filter((c) => kind === "all" || c.kind === kind);
  // 영상·쇼츠 버튼에 개수 표시 (팬튜브는 대부분 쇼츠라 어디에 있는지 보이게)
  const count = (short: boolean) =>
    videos.filter((v) => v.short === short && (kind === "all" || v.kind === kind) && (!channel || v.channelId === channel)).length;

  const reset = () => setShown(PAGE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex border border-lilac-500 text-sm font-semibold" role="group" aria-label="영상 길이">
          {(
            [
              ["long", "영상"],
              ["short", "쇼츠"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={format === k}
              onClick={() => (setFormat(k), reset())}
              className={`px-4 py-1.5 hover:transform-none ${format === k ? "bg-lilac-500 text-white" : "bg-white text-lilac-700"}`}
            >
              {label} <span className="font-normal opacity-80 tabular-nums">{count(k === "short")}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5" role="group" aria-label="채널 종류">
          {(
            [
              ["all", "전체"],
              ["official", "오피셜"],
              ["fan", "팬튜브"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => (setKind(k), setChannel(null), reset())} className={chip(kind === k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 채널 버튼: 휴대폰은 옆으로 밀어서, PC 는 여러 줄로 */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="채널">
        <button type="button" aria-pressed={!channel} onClick={() => (setChannel(null), reset())} className={chip(!channel)}>
          모든 채널
        </button>
        {chips.map((c) => (
          <button
            key={c.channel_id}
            type="button"
            aria-pressed={channel === c.channel_id}
            onClick={() => (setChannel(c.channel_id), reset())}
            className={chip(channel === c.channel_id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState>이 조건에 맞는 최근 영상이 없어요.</EmptyState>
      ) : (
        <>
          <VideoGrid videos={list.slice(0, shown)} shorts={format === "short"} />
          {shown < list.length && (
            <div className="text-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="border border-lilac-300 bg-white px-6 py-2 text-sm font-semibold text-lilac-700 hover:bg-lilac-100">
                더 보기 ({list.length - shown})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
