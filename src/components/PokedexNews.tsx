import Link from "next/link";
import CardImage from "@/components/CardImage";
import PokedexRanking from "@/components/PokedexRanking";
import { pokedexMemberName } from "@/data/members";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { ContributorRank } from "@/lib/community";
import type { CatalogCard } from "@/types";
import { MoreLink } from "./ui";

/** 홈 화면: 다 같이 채우는 도감 진행률 · 최근 채워진 카드 · 랭킹 TOP3 */
export default async function PokedexNews({
  total,
  filled,
  recent,
  ranking,
}: {
  total: number;
  filled: number;
  recent: { card: CatalogCard; nickname?: string }[];
  ranking: ContributorRank[];
}) {
  const { m, locale } = await getI18n();
  const percent = total ? Math.round((filled / total) * 100) : 0;
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">{m.home.pokedexTitle}</h2>
        <MoreLink href="/photocards">{m.home.pokedexMore}</MoreLink>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tabular-nums">{filled}</span>
        <span className="text-sm text-ink-soft tabular-nums">
          {fmt(m.home.pokedexCount, { total, percent })}
        </span>
      </div>
      <div className="mt-2 h-2.5 bg-lilac-100">
        <div className="h-full bg-gradient-to-r from-lilac-500 to-blush-400" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <h3 className="mb-2 text-sm font-semibold">{m.home.recentFilled}</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-soft">
              {m.home.noFilledBefore}
              <Link href="/photocards?need=image" className="font-semibold text-lilac-700 underline">
                {m.home.noFilledLink}
              </Link>
              {m.home.noFilledAfter}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {recent.map(({ card, nickname }) => (
                <li key={card.id}>
                  <Link href={`/photocards/${card.id}`} className="block">
                    <CardImage card={card} />
                    <p className="mt-1 truncate text-xs font-semibold">
                      {card.album} · {pokedexMemberName(card.member, locale)}
                    </p>
                    {nickname && <p className="truncate text-[11px] text-lilac-700">{fmt(m.home.filledBy, { name: nickname })}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">{m.home.rankingTitle}</h3>
          <PokedexRanking ranking={ranking} />
        </div>
      </div>
    </section>
  );
}
