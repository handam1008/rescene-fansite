/**
 * 언어 설정. 고른 언어는 "lang" 쿠키에 저장하고 주소는 그대로 둠.
 * 쿠키가 없으면 한국어 (검색 로봇도 한국어 페이지를 보도록)
 */
export const LOCALES = ["ko", "ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "lang";

/** 언어 고르기 버튼에 쓰는 이름 (각 언어로) */
export const LOCALE_NAMES: Record<Locale, string> = { ko: "한국어", ja: "日本語", en: "English" };

/** 날짜·숫자 표시(Intl)에 넘기는 언어 태그 */
export const INTL_LOCALE: Record<Locale, string> = { ko: "ko-KR", ja: "ja-JP", en: "en-US" };

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * 문장 안의 {이름} 자리에 값 넣기: fmt("{n}개", { n: 3 }) → "3개"
 * 영어 단·복수는 {n|단수|복수}: fmt("{n} {n|like|likes}", { n: 1 }) → "1 like"
 */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s
    .replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, (all, k: string, one: string, other: string) =>
      k in vars ? (Number(vars[k]) === 1 ? one : other) : all,
    )
    .replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
}
