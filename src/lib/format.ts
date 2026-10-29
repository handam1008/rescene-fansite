import { INTL_LOCALE, type Locale } from "@/i18n/config";
import type { StreamingPlatform } from "@/types";

/** 서버(Vercel은 UTC)와 방문자 기기에 상관없이 한국 시간으로 표시 */
const TIME_ZONE = "Asia/Seoul";

// locale: 화면 언어 (날짜 모양만 바뀌고 시간은 늘 한국 시간)

export function formatDate(iso: string, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
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

/** 달력 제목: "2026년 10월" / "2026年10月" / "October 2026" */
export function formatMonthYear(year: number, month: number, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: "UTC", year: "numeric", month: "long" }).format(
    new Date(Date.UTC(year, month - 1, 15)),
  );
}

/** 달 이름만: "9월" / "9月" / "Sep" */
export function formatMonthShort(month: number, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: "UTC", month: "short" }).format(new Date(Date.UTC(2026, month - 1, 15)));
}

/** "10월 3일" / "10月3日" / "October 3" (한국 날짜 "2026-10-03" 기준) */
export function formatMonthDay(key: string, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIME_ZONE, month: "long", day: "numeric" }).format(
    new Date(`${key}T12:00:00+09:00`),
  );
}

/** 요일 이름 7개 (일요일부터): "일".."토" / "日".."土" / "Sun".."Sat" */
export function weekdayNames(locale: Locale = "ko") {
  const f = new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: "UTC", weekday: "short" });
  // 2023-01-01 은 일요일
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2023, 0, 1 + i))));
}

/** 시각만 "18:00" (한국 시간) */
export function formatTime(iso: string, locale: Locale = "ko") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

const koPlatforms: Record<StreamingPlatform, string> = {
  melon: "멜론",
  genie: "지니",
  bugs: "벅스",
  flo: "플로",
  vibe: "바이브",
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
};

const intlPlatforms: Record<StreamingPlatform, string> = {
  melon: "Melon",
  genie: "Genie",
  bugs: "Bugs",
  flo: "FLO",
  vibe: "VIBE",
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
};

/** 음원 사이트 이름 (한국어는 한글, 그 외는 영문 표기) */
export const platformLabels = (locale: Locale = "ko") => (locale === "ko" ? koPlatforms : intlPlatforms);
