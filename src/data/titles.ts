/**
 * 포카 도감 칭호. 관리자가 승인한 카드 수(collected_count)로 정해집니다.
 * 기준 숫자·이름은 자유롭게 바꿔도 돼요. 위에서부터 높은 단계 순서로 적어주세요.
 */
export const titles = [
  { min: 50, name: "전설의 리마인", className: "bg-gradient-to-r from-lilac-500 to-blush-400 text-white" },
  { min: 30, name: "포카 마스터", className: "bg-lilac-500 text-white" },
  { min: 15, name: "포카 컬렉터", className: "bg-lilac-200 text-lilac-700" },
  { min: 5, name: "포카 수집가", className: "bg-sky-dream-200 text-sky-700" },
  { min: 1, name: "포카 새싹", className: "bg-mint-dream-200 text-emerald-700" },
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
  { maxRank: 1, name: "👑 도감 개척왕", className: "bg-gradient-to-r from-amber-400 to-blush-400 text-white" },
  { maxRank: 3, name: "도감 개척자 TOP3", className: "bg-gradient-to-r from-lilac-500 to-sky-dream-200 text-white" },
  { maxRank: 10, name: "도감 개척자 TOP10", className: "border border-lilac-500 bg-white text-lilac-700" },
] as const;

export type ContributorTitle = { name: string; className: string };

export function contributorTitleFor(rank: number | null | undefined, count: number | null | undefined): ContributorTitle | undefined {
  if (!count) return undefined;
  return contributorTitles.find((t) => rank && rank <= t.maxRank) ?? { name: "도감 기여자", className: "bg-lilac-100 text-lilac-700" };
}

/** 다음 칭호까지 남은 장수 (최고 단계면 undefined) */
export function nextTitle(count: number) {
  const next = [...titles].reverse().find((t) => count < t.min);
  return next ? { title: next, remaining: next.min - count } : undefined;
}
