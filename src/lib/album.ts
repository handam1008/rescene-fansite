import type { Locale } from "@/i18n/config";

/**
 * 앨범 이름 번역: "미니 4집 PULSE" → "4thミニアルバム PULSE" / "4th Mini Album PULSE".
 * 곡·앨범 고유 이름(PULSE 등)은 그대로 두고 앞뒤의 한국어 설명만 바꿈
 */
const ORD = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

const RULES: Record<Exclude<Locale, "ko">, [RegExp, (n: number) => string][]> = {
  ja: [
    [/미니 (\d+)집/, (n) => `${ORD(n)}ミニアルバム`],
    [/싱글 (\d+)집/, (n) => `${ORD(n)}シングル`],
  ],
  en: [
    [/미니 (\d+)집/, (n) => `${ORD(n)} Mini Album`],
    [/싱글 (\d+)집/, (n) => `${ORD(n)} Single Album`],
  ],
};

const WORDS: Record<Exclude<Locale, "ko">, [string, string][]> = {
  ja: [
    ["디지털 싱글", "デジタルシングル"],
    ["스페셜 싱글", "スペシャルシングル"],
    ["(선공개)", "（先行公開）"],
    ["(리메이크)", "（リメイク）"],
    ["(데뷔)", "（デビュー）"],
  ],
  en: [
    ["디지털 싱글", "Digital Single"],
    ["스페셜 싱글", "Special Single"],
    ["(선공개)", "(pre-release)"],
    ["(리메이크)", "(remake)"],
    ["(데뷔)", "(debut)"],
  ],
};

export function albumLabel(album: string, locale: Locale = "ko") {
  if (locale === "ko") return album;
  let s = album;
  for (const [re, f] of RULES[locale]) s = s.replace(re, (_, n: string) => f(Number(n)));
  for (const [ko, t] of WORDS[locale]) s = s.replace(ko, t);
  return s;
}
