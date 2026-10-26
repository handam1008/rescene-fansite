import type { StreamingPlatform } from "@/types";

/** 서버(Vercel은 UTC)와 방문자 기기에 상관없이 한국 시간으로 표시 */
const TIME_ZONE = "Asia/Seoul";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** 게시판 목록용: 오늘 쓴 글은 "14:05", 그 외는 "10.26" (디시인사이드 방식) */
export function formatBoardDate(iso: string, now: Date = new Date()) {
  const day = (d: Date) =>
    new Intl.DateTimeFormat("ko-KR", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const date = new Date(iso);
  if (day(date) === day(now)) {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
  const parts = new Intl.DateTimeFormat("ko-KR", { timeZone: TIME_ZONE, month: "2-digit", day: "2-digit" })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.month}.${parts.day}`;
}

/** 글 본문용: "2026.10.27 00:30" */
export function formatFullDateTime(iso: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

export const platformLabels: Record<StreamingPlatform, string> = {
  melon: "멜론",
  genie: "지니",
  bugs: "벅스",
  flo: "플로",
  vibe: "바이브",
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
};
