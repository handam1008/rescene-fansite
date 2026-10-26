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
