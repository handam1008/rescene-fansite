import type { Locale } from "@/i18n/config";
import { albumLabel } from "@/lib/album";
import type { Comeback, Vote } from "@/types";

/** 투표 버튼 이름 번역 (한국어 이름 그대로를 열쇠로) */
const LINK_LABELS: Record<string, Record<"ja" | "en", string>> = {
  멜론: { ja: "Melon", en: "Melon" },
  "X 해시태그 투표": { ja: "Xハッシュタグ投票", en: "X hashtag vote" },
  "X 인증 헬퍼 (음원총공팀)": { ja: "X認証ヘルパー（音源総攻撃チーム）", en: "X verification helper (streaming team)" },
  "연합 인증 헬퍼 (음원총공팀)": { ja: "連合認証ヘルパー（音源総攻撃チーム）", en: "Ally verification helper (streaming team)" },
};

/** 화면 언어에 맞춘 투표 정보 (번역이 없는 칸은 한국어 그대로) */
export function localizeVote<T extends Vote>(v: T, locale: Locale): T {
  if (locale === "ko") return v;
  const t = v.i18n?.[locale];
  return {
    ...v,
    awardName: t?.awardName ?? v.awardName,
    category: t?.category ?? v.category,
    steps: t?.steps ?? v.steps,
    note: t?.note ?? v.note,
    alert: t?.alert ?? v.alert,
    links: v.links.map((l) => ({ ...l, label: LINK_LABELS[l.label]?.[locale] ?? l.label })),
  };
}

/** 화면 언어에 맞춘 컴백 정보 */
export function localizeComeback<T extends Comeback>(c: T, locale: Locale): T {
  if (locale === "ko") return c;
  const t = c.i18n?.[locale];
  return {
    ...c,
    albumType: albumLabel(c.albumType, locale),
    description: t?.description ?? c.description,
    tracklist: t?.tracklist ?? c.tracklist,
    teasers: c.teasers.map((x, i) => ({ ...x, title: t?.teasers?.[i] ?? x.title })),
  };
}
