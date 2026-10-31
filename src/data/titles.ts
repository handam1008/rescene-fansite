/**
 * 포카 도감 칭호. 관리자가 승인한 카드 수(collected_count)로 정해집니다.
 * 기준 숫자·이름은 자유롭게 바꿔도 돼요. 위에서부터 높은 단계 순서로 적어주세요.
 */
export const titles = [
  { min: 50, name: "전설의 리마인", ja: "伝説のREMINE", en: "Legendary REMINE", className: "bg-gradient-to-r from-lilac-500 to-blush-400 text-white" },
  { min: 30, name: "포카 마스터", ja: "トレカマスター", en: "Photocard Master", className: "bg-lilac-500 text-white" },
  { min: 15, name: "포카 컬렉터", ja: "トレカコレクター", en: "Photocard Collector", className: "bg-lilac-200 text-lilac-700" },
  { min: 5, name: "포카 수집가", ja: "トレカ収集家", en: "Photocard Gatherer", className: "bg-sky-dream-200 text-sky-700" },
  { min: 1, name: "포카 새싹", ja: "トレカ初心者", en: "Photocard Sprout", className: "bg-mint-dream-200 text-emerald-700" },
] as const;

export type Title = (typeof titles)[number];

export function titleFor(count: number | null | undefined): Title | undefined {
  return titles.find((t) => (count ?? 0) >= t.min);
}

/**
 * 도감 기여 칭호(보상). 빈 카드를 처음 채운 장수의 순위로 정해집니다.
 * 순위는 DB(0006 SQL)가 사진이 채워질 때마다 다시 계산해요.
 */
export const contributorTitles = [
  { maxRank: 1, name: "👑 도감 개척왕", ja: "👑 図鑑開拓王", en: "👑 Pioneer King", className: "bg-gradient-to-r from-amber-400 to-blush-400 text-white" },
  { maxRank: 3, name: "도감 개척자 TOP3", ja: "図鑑開拓者 TOP3", en: "Pioneer TOP3", className: "bg-gradient-to-r from-lilac-500 to-sky-dream-200 text-white" },
  { maxRank: 10, name: "도감 개척자 TOP10", ja: "図鑑開拓者 TOP10", en: "Pioneer TOP10", className: "border border-lilac-500 bg-white text-lilac-700" },
] as const;

export type ContributorTitle = { name: string; ja: string; en: string; className: string };

export function contributorTitleFor(rank: number | null | undefined, count: number | null | undefined): ContributorTitle | undefined {
  if (!count) return undefined;
  return (
    contributorTitles.find((t) => rank && rank <= t.maxRank) ?? {
      name: "도감 기여자",
      ja: "図鑑貢献者",
      en: "Contributor",
      className: "bg-lilac-100 text-lilac-700",
    }
  );
}

/**
 * 퀴즈 배틀 칭호 (0022 SQL). 이번 주 1·2·3등은 그 주에만 보이고(월요일 0시 한국 시간에 바뀜),
 * 명예의 전당 1등(역대 최고 기록)은 누가 기록을 깰 때까지 계속 보임
 */
export const quizFameTitle: ContributorTitle = {
  name: "🏛️ 퀴즈 명예의 전당",
  ja: "🏛️ クイズ殿堂入り",
  en: "🏛️ Quiz Hall of Fame",
  className: "bg-gradient-to-r from-amber-400 to-lilac-500 text-white",
};

const quizWeekTitles: ContributorTitle[] = [
  { name: "🥇 이번 주 퀴즈왕", ja: "🥇 今週のクイズ王", en: "🥇 Quiz King this week", className: "bg-amber-400 text-white" },
  { name: "🥈 퀴즈 2위", ja: "🥈 クイズ2位", en: "🥈 Quiz #2", className: "bg-slate-300 text-ink" },
  { name: "🥉 퀴즈 3위", ja: "🥉 クイズ3位", en: "🥉 Quiz #3", className: "bg-orange-200 text-orange-800" },
];

/** 이번 주 월요일 (한국 시간) "YYYY-MM-DD" */
export function kstWeekStart(now: Date = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600_000);
  const day = (kst.getUTCDay() + 6) % 7; // 월요일 0
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - day)).toISOString().slice(0, 10);
}

export function quizWeekTitleFor(rank: number | null | undefined, week: string | null | undefined): ContributorTitle | undefined {
  if (!rank || rank > 3 || week !== kstWeekStart()) return undefined;
  return quizWeekTitles[rank - 1];
}

/** 다음 칭호까지 남은 장수 (최고 단계면 undefined) */
export function nextTitle(count: number) {
  const next = [...titles].reverse().find((t) => count < t.min);
  return next ? { title: next, remaining: next.min - count } : undefined;
}

/** 칭호 이름 (화면 언어별) */
export const titleName = (t: { name: string; ja: string; en: string }, locale: "ko" | "ja" | "en") =>
  locale === "ja" ? t.ja : locale === "en" ? t.en : t.name;

