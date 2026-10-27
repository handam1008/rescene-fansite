import { contributorTitleFor } from "@/data/titles";
import type { ContributorRank } from "@/lib/community";

/** 도감 기여 랭킹: 빈 카드를 처음 채운 장수 순 */
export default function PokedexRanking({ ranking, myId }: { ranking: ContributorRank[]; myId?: string }) {
  if (ranking.length === 0) {
    return <p className="text-sm text-ink-soft">아직 채워진 카드가 없어요. 첫 번째 개척자가 되어주세요!</p>;
  }
  return (
    <ol className="divide-y divide-lilac-100">
      {ranking.map((r) => {
        const title = contributorTitleFor(r.contributor_rank, r.contributed_count);
        return (
          <li key={r.id} className={`flex items-center gap-2 py-1.5 text-sm ${r.id === myId ? "bg-lilac-50" : ""}`}>
            <span
              className={`w-6 shrink-0 text-center font-black tabular-nums ${r.contributor_rank <= 3 ? "text-lilac-700" : "text-ink-soft"}`}
            >
              {r.contributor_rank}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">{r.nickname}</span>
            {title && r.contributor_rank <= 10 && (
              <span className={`hidden shrink-0 px-1 text-[10px] leading-4 font-bold sm:inline ${title.className}`}>{title.name}</span>
            )}
            <span className="shrink-0 text-xs text-ink-soft tabular-nums">{r.contributed_count}장</span>
          </li>
        );
      })}
    </ol>
  );
}
