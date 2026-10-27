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

/** 다음 칭호까지 남은 장수 (최고 단계면 undefined) */
export function nextTitle(count: number) {
  const next = [...titles].reverse().find((t) => count < t.min);
  return next ? { title: next, remaining: next.min - count } : undefined;
}
