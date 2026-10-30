import ShareButtons from "@/components/ShareButtons";
import type { Metadata } from "next";
import Link from "next/link";
import CardImage from "@/components/CardImage";
import PokedexRanking from "@/components/PokedexRanking";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { pokedexMemberName, pokedexMembersFor } from "@/data/members";
import { cardLabel, cardSourceUrl, pokedexSources, setInfo, setName, sourceName } from "@/data/pokedex-sets";
import { contributorTitleFor, nextTitle, titleFor, titleName } from "@/data/titles";
import { fmt, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { getI18n } from "@/i18n/server";
import { getCatalog, getContributorRanking, getMyCollections, getNicknames } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import type { CatalogCard, CollectionEntry } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.pokedex.title };
}

// 내 수집 현황을 매번 새로 불러옴
export const dynamic = "force-dynamic";

const statusBadge: Record<CollectionEntry["status"], { label: "statusApproved" | "statusPending" | "statusRejected"; className: string }> = {
  approved: { label: "statusApproved", className: "bg-lilac-500 text-white" },
  pending: { label: "statusPending", className: "bg-sky-dream-200 text-sky-700" },
  rejected: { label: "statusRejected", className: "bg-blush-200 text-ink" },
};

function CardTile({
  card,
  entry,
  contributor,
  m,
  locale,
}: {
  card: CatalogCard;
  entry?: CollectionEntry;
  contributor?: string;
  m: Messages;
  locale: Locale;
}) {
  const badge = entry ? statusBadge[entry.status] : null;
  return (
    <Link href={`/photocards/${card.id}`} className="group block">
      <div className="relative">
        <CardImage card={card} />
        {badge && (
          <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold ${badge.className}`}>
            {m.pokedex[badge.label]}
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-xs font-semibold">{pokedexMemberName(card.member, locale)}</p>
      {card.label && <p className="truncate text-[11px] text-ink-soft">{cardLabel(card.label, locale)}</p>}
      {contributor && <p className="truncate text-[11px] text-lilac-700">📷 {contributor}</p>}
    </Link>
  );
}

function FilterChips({
  items,
  activeKey,
  hrefFor,
  label,
}: {
  items: { key: string; name: string }[];
  activeKey: string;
  hrefFor: (key: string) => string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1.5 whitespace-nowrap">
        {items.map((f) => {
          const active = activeKey === f.key;
          return (
            <li key={f.key || "all"}>
              <Link
                href={hrefFor(f.key)}
                aria-current={active ? "page" : undefined}
                className={`block border px-3 py-1 text-sm ${
                  active ? "border-lilac-500 bg-lilac-500 font-semibold text-white" : "border-lilac-200 bg-white hover:bg-lilac-100"
                }`}
              >
                {f.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default async function PhotocardsPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; source?: string; need?: string }>;
}) {
  const { m, locale } = await getI18n();
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader eyebrow="Photocard" title={m.pokedex.title} />
        <SupabaseNotice />
      </>
    );
  }

  const params = await searchParams;
  const [catalog, user, ranking] = await Promise.all([getCatalog(), getCurrentUser(), getContributorRanking(10)]);
  const [mine, contributorNames] = await Promise.all([
    getMyCollections(user?.id),
    getNicknames(catalog.map((c) => c.first_contributor)),
  ]);

  // 출처 탭: 정해둔 순서대로, 그 외 출처는 뒤에
  const sourceOf = (c: CatalogCard) => c.source ?? "앨범";
  const present = [...new Set(catalog.map(sourceOf))];
  const sources = [...pokedexSources.filter((s) => present.includes(s)), ...present.filter((s) => !pokedexSources.includes(s))];
  const source = sources.find((s) => s === params.source) ?? "";
  const memberList = pokedexMembersFor(locale);
  const member = memberList.find((x) => x.slug === params.member)?.slug ?? "";
  // 도감 이미지가 아직 없는 카드만 보기
  const needImage = params.need === "image";

  const hrefWith = (next: { source?: string; member?: string; needImage?: boolean }) => {
    const q = new URLSearchParams();
    const s = next.source ?? source;
    const mem = next.member ?? member;
    if (s) q.set("source", s);
    if (mem) q.set("member", mem);
    if (next.needImage ?? needImage) q.set("need", "image");
    const qs = q.toString();
    return qs ? `/photocards?${qs}` : "/photocards";
  };

  const cards = catalog.filter(
    (c) => (!source || sourceOf(c) === source) && (!member || c.member === member) && (!needImage || !c.image_path),
  );
  const missingImages = catalog.filter((c) => !c.image_path).length;
  const sets = new Map<string, CatalogCard[]>();
  for (const c of cards) sets.set(c.album, [...(sets.get(c.album) ?? []), c]);
  const orderedSets = [...sets.entries()].sort(
    ([a, ca], [b, cb]) => sources.indexOf(sourceOf(ca[0])) - sources.indexOf(sourceOf(cb[0])) || ca[0].id - cb[0].id || a.localeCompare(b),
  );

  const filled = catalog.length - missingImages;
  const filledPercent = catalog.length ? Math.round((filled / catalog.length) * 100) : 0;
  const myContribution = contributorTitleFor(user?.contributorRank, user?.contributedCount);
  const approved = catalog.filter((c) => mine.get(c.id)?.status === "approved").length;
  const pendingCount = [...mine.values()].filter((e) => e.status === "pending").length;
  const title = titleFor(user?.collectedCount);
  const next = nextTitle(user?.collectedCount ?? 0);
  // 한 멤버 카드를 전부 모은 경우 "OO 컴플리트"
  const completed = memberList.filter((mem) => {
    const theirs = catalog.filter((c) => c.member === mem.slug);
    return theirs.length > 0 && theirs.every((c) => mine.get(c.id)?.status === "approved");
  });

  return (
    <>
      <PageHeader
        eyebrow="Photocard"
        title={m.pokedex.title}
        description={m.pokedex.desc}
      />
      <ShareButtons text={m.pokedex.title + " · RESCENE"} className="-mt-3 mb-5" />

      {/* 다 같이 채우는 도감 */}
      <section className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="card p-5">
          <p className="text-sm font-semibold text-lilac-700">{m.pokedex.together}</p>
          <p className="mt-0.5 text-3xl font-extrabold tabular-nums">
            {filled}{" "}
            <span className="text-base font-semibold text-ink-soft">
              {fmt(m.pokedex.countOf, { total: catalog.length, percent: filledPercent })}
            </span>
          </p>
          <div className="mt-3 h-3 bg-lilac-100">
            <div className="h-full bg-gradient-to-r from-lilac-500 to-blush-400" style={{ width: `${filledPercent}%` }} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {missingImages > 0 ? (
              <>
                {m.pokedex.missingBefore}
                <b className="text-ink">{fmt(m.pokedex.missingCount, { n: missingImages })}</b>
                {m.pokedex.missingAfter}
                <Link href={hrefWith({ needImage: true })} className="font-semibold text-lilac-700 underline">
                  {m.pokedex.seeEmpty}
                </Link>
              </>
            ) : (
              m.pokedex.allFilled
            )}
          </p>
        </div>
        <div className="card p-5">
          <h2 className="mb-2 font-bold">{m.pokedex.ranking}</h2>
          <PokedexRanking ranking={ranking} myId={user?.id} />
          <p className="mt-3 border-t border-lilac-100 pt-2 text-[11px] leading-relaxed text-ink-soft">
            {m.pokedex.rankingNote}
          </p>
        </div>
      </section>

      {/* 내 수집 현황 */}
      <section className="card mb-6 p-4">
        {user ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-sm">
                <span className="text-ink-soft">{m.pokedex.myCollection} </span>
                <b className="tabular-nums">
                  {approved} / {catalog.length}
                </b>
                {pendingCount > 0 && <span className="ml-1.5 text-xs text-sky-700">{fmt(m.pokedex.pendingN, { n: pendingCount })}</span>}
              </p>
              <p className="text-sm">
                <span className="text-ink-soft">{m.pokedex.firstFilled} </span>
                <b className="tabular-nums">{fmt(m.pokedex.cards, { n: user.contributedCount ?? 0 })}</b>
                {user.contributorRank && (
                  <span className="ml-1 text-xs text-lilac-700">{fmt(m.pokedex.rankN, { n: user.contributorRank })}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {myContribution && (
                <span className={`px-2 py-0.5 text-xs font-bold ${myContribution.className}`}>{titleName(myContribution, locale)}</span>
              )}
              {title && <span className={`px-2 py-0.5 text-xs font-bold ${title.className}`}>{titleName(title, locale)}</span>}
              {completed.map((mem) => (
                <span key={mem.slug} className="border border-lilac-500 px-2 py-0.5 text-xs font-bold text-lilac-700">
                  {fmt(m.pokedex.complete, { name: mem.name })}
                </span>
              ))}
              {next && (
                <span className="text-xs text-ink-soft">
                  {fmt(m.pokedex.nextTitleBefore, { n: next.remaining })}
                  <b className="text-ink">{titleName(next.title, locale)}</b>
                  {m.pokedex.nextTitleAfter}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm">
            <Link href="/login?next=/photocards" className="font-semibold text-lilac-700 underline">
              {m.pokedex.login}
            </Link>
            {m.pokedex.loginAfter}
          </p>
        )}
        {user?.isAdmin && (
          <p className="mt-3 border-t border-lilac-100 pt-3 text-xs">
            {m.pokedex.adminMenu}{" "}
            <Link href="/admin" className="font-semibold text-lilac-700 underline">
              {m.pokedex.adminLink}
            </Link>
          </p>
        )}
      </section>

      {/* 출처 탭 (전체 / 앨범 / CU 리센느빵 / 할리스 …) */}
      <div className="mb-2 flex border-b-2 border-lilac-500">
        <div className="no-scrollbar flex overflow-x-auto">
          {[{ key: "", name: m.pokedex.all }, ...sources.map((s) => ({ key: s, name: sourceName(s, locale) }))].map((t) => (
            <Link
              key={t.key || "all"}
              href={hrefWith({ source: t.key })}
              aria-current={source === t.key ? "page" : undefined}
              className={`shrink-0 px-4 py-2 text-sm font-bold ${
                source === t.key ? "bg-lilac-500 text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="mb-6 space-y-2">
        <FilterChips
          label={m.pokedex.memberFilter}
          items={[{ key: "", name: m.pokedex.allMembers }, ...memberList.map((mem) => ({ key: mem.slug, name: mem.name }))]}
          activeKey={member}
          hrefFor={(key) => hrefWith({ member: key })}
        />
        {missingImages > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
            <Link
              href={hrefWith({ needImage: !needImage })}
              aria-pressed={needImage}
              className={`border px-2.5 py-1 font-semibold ${
                needImage ? "border-lilac-500 bg-lilac-500 text-white" : "border-lilac-500 bg-white text-lilac-700 hover:bg-lilac-100"
              }`}
            >
              {fmt(m.pokedex.needImage, { n: missingImages })}
              {needImage && " ✕"}
            </Link>
            <span>{m.pokedex.needImageHint}</span>
          </p>
        )}
      </div>

      {catalog.length === 0 ? (
        <EmptyState>
          <p className="font-semibold text-ink">{m.pokedex.preparing}</p>
          <p className="mt-1">{m.pokedex.preparingDesc}</p>
        </EmptyState>
      ) : cards.length === 0 ? (
        <EmptyState>{m.pokedex.noMatch}</EmptyState>
      ) : (
        <div className="space-y-10">
          {orderedSets.map(([album, list]) => {
            const got = list.filter((c) => mine.get(c.id)?.status === "approved").length;
            const setFilled = list.filter((c) => c.image_path).length;
            const meta = setInfo(album, locale);
            const link = cardSourceUrl(list[0]);
            return (
              <section key={album}>
                <div className="mb-3 border-b-2 border-lilac-500 pb-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-bold">
                      {setName(album, locale)}
                      {!source && <span className="ml-2 text-xs font-semibold text-lilac-500">{sourceName(sourceOf(list[0]), locale)}</span>}
                    </h2>
                    <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                      {fmt(m.pokedex.setFilled, { a: setFilled, b: list.length })}
                      {user && <span className="ml-2 text-lilac-700">{fmt(m.pokedex.setMine, { n: got })}</span>}
                    </span>
                  </div>
                  {(meta || link) && (
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {meta?.how}
                      {meta?.note && <span className="block text-[11px] text-ink-soft/80">※ {meta.note}</span>}
                      {link && (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="ml-1.5 underline hover:text-ink">
                          {m.pokedex.source}
                        </a>
                      )}
                    </p>
                  )}
                </div>
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                  {list.map((card) => (
                    <li key={card.id}>
                      <CardTile
                        card={card}
                        entry={mine.get(card.id)}
                        contributor={card.first_contributor ? contributorNames.get(card.first_contributor) : undefined}
                        m={m}
                        locale={locale}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
