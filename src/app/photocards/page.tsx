import type { Metadata } from "next";
import Link from "next/link";
import CardImage from "@/components/CardImage";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { pokedexMemberName, pokedexMembers } from "@/data/members";
import { pokedexSets, pokedexSources } from "@/data/pokedex-sets";
import { nextTitle, titleFor } from "@/data/titles";
import { getCatalog, getMyCollections } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import type { CatalogCard, CollectionEntry } from "@/types";

export const metadata: Metadata = { title: "포카 도감" };

// 내 수집 현황을 매번 새로 불러옴
export const dynamic = "force-dynamic";

const statusBadge: Record<CollectionEntry["status"], { label: string; className: string }> = {
  approved: { label: "✓ 수집", className: "bg-lilac-500 text-white" },
  pending: { label: "확인 중", className: "bg-sky-dream-200 text-sky-700" },
  rejected: { label: "다시 인증", className: "bg-blush-200 text-ink" },
};

function CardTile({ card, entry }: { card: CatalogCard; entry?: CollectionEntry }) {
  const badge = entry ? statusBadge[entry.status] : null;
  return (
    <Link href={`/photocards/${card.id}`} className="group block">
      <div className="relative">
        <CardImage card={card} dim={entry?.status !== "approved"} />
        {badge && (
          <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
        )}
      </div>
      <p className="mt-1 truncate text-xs font-semibold">{pokedexMemberName(card.member)}</p>
      {card.label && <p className="truncate text-[11px] text-ink-soft">{card.label}</p>}
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
  searchParams: Promise<{ member?: string; source?: string }>;
}) {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader eyebrow="Photocard" title="포카 도감" />
        <SupabaseNotice />
      </>
    );
  }

  const params = await searchParams;
  const [catalog, user] = await Promise.all([getCatalog(), getCurrentUser()]);
  const mine = await getMyCollections(user?.id);

  // 출처 탭: 정해둔 순서대로, 그 외 출처는 뒤에
  const sourceOf = (c: CatalogCard) => c.source ?? "앨범";
  const present = [...new Set(catalog.map(sourceOf))];
  const sources = [...pokedexSources.filter((s) => present.includes(s)), ...present.filter((s) => !pokedexSources.includes(s))];
  const source = sources.find((s) => s === params.source) ?? "";
  const member = pokedexMembers.find((m) => m.slug === params.member)?.slug ?? "";

  const hrefWith = (next: { source?: string; member?: string }) => {
    const q = new URLSearchParams();
    const s = next.source ?? source;
    const m = next.member ?? member;
    if (s) q.set("source", s);
    if (m) q.set("member", m);
    const qs = q.toString();
    return qs ? `/photocards?${qs}` : "/photocards";
  };

  const cards = catalog.filter((c) => (!source || sourceOf(c) === source) && (!member || c.member === member));
  const sets = new Map<string, CatalogCard[]>();
  for (const c of cards) sets.set(c.album, [...(sets.get(c.album) ?? []), c]);
  const orderedSets = [...sets.entries()].sort(
    ([a, ca], [b, cb]) => sources.indexOf(sourceOf(ca[0])) - sources.indexOf(sourceOf(cb[0])) || ca[0].id - cb[0].id || a.localeCompare(b),
  );

  const approved = catalog.filter((c) => mine.get(c.id)?.status === "approved").length;
  const pendingCount = [...mine.values()].filter((e) => e.status === "pending").length;
  const title = titleFor(user?.collectedCount);
  const next = nextTitle(user?.collectedCount ?? 0);
  // 한 멤버 카드를 전부 모은 경우 "OO 컴플리트"
  const completed = pokedexMembers.filter((m) => {
    const theirs = catalog.filter((c) => c.member === m.slug);
    return theirs.length > 0 && theirs.every((c) => mine.get(c.id)?.status === "approved");
  });

  return (
    <>
      <PageHeader
        eyebrow="Photocard"
        title="포카 도감"
        description="내가 가진 실물 포카를 찍어서 인증하면, 확인 후 도감이 채워져요."
      />

      {/* 내 도감 현황 */}
      <section className="card mb-6 p-5">
        {user ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-ink-soft">{user.nickname}님의 도감</p>
              <p className="mt-0.5 text-2xl font-extrabold tabular-nums">
                {approved} <span className="text-base font-semibold text-ink-soft">/ {catalog.length}장</span>
              </p>
              {pendingCount > 0 && <p className="text-xs text-sky-700">확인 중 {pendingCount}장</p>}
            </div>
            <div className="sm:w-1/2">
              <div className="flex flex-wrap items-center gap-1.5">
                {title ? (
                  <span className={`px-2 py-0.5 text-xs font-bold ${title.className}`}>{title.name}</span>
                ) : (
                  <span className="text-xs text-ink-soft">아직 칭호가 없어요</span>
                )}
                {completed.map((m) => (
                  <span key={m.slug} className="border border-lilac-500 px-2 py-0.5 text-xs font-bold text-lilac-700">
                    {m.name} 컴플리트
                  </span>
                ))}
              </div>
              <div className="mt-2 h-2 bg-lilac-100">
                <div
                  className="h-full bg-lilac-500"
                  style={{ width: `${catalog.length ? Math.round((approved / catalog.length) * 100) : 0}%` }}
                />
              </div>
              {next && (
                <p className="mt-1 text-xs text-ink-soft">
                  {next.remaining}장 더 모으면 <b className="text-ink">{next.title.name}</b>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm">
            <Link href="/login?next=/photocards" className="font-semibold text-lilac-700 underline">
              로그인
            </Link>
            하면 내 포카를 인증하고 칭호를 받을 수 있어요.
          </p>
        )}
        {user?.isAdmin && (
          <p className="mt-3 border-t border-lilac-100 pt-3 text-xs">
            운영자 메뉴:{" "}
            <Link href="/admin" className="font-semibold text-lilac-700 underline">
              도감 카드 등록 · 인증 확인
            </Link>
          </p>
        )}
      </section>

      {/* 출처 탭 (전체 / 앨범 / CU 리센느빵 / 할리스 …) */}
      <div className="mb-2 flex border-b-2 border-lilac-500">
        <div className="no-scrollbar flex overflow-x-auto">
          {[{ key: "", name: "전체" }, ...sources.map((s) => ({ key: s, name: s }))].map((t) => (
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
      <div className="mb-6">
        <FilterChips
          label="멤버 필터"
          items={[{ key: "", name: "모든 멤버" }, ...pokedexMembers.map((m) => ({ key: m.slug, name: m.name }))]}
          activeKey={member}
          hrefFor={(key) => hrefWith({ member: key })}
        />
      </div>

      {catalog.length === 0 ? (
        <EmptyState>
          <p className="font-semibold text-ink">도감을 준비하고 있어요</p>
          <p className="mt-1">운영자가 공식 포토카드를 등록하면 여기에 채워져요.</p>
        </EmptyState>
      ) : cards.length === 0 ? (
        <EmptyState>조건에 맞는 카드가 아직 없어요.</EmptyState>
      ) : (
        <div className="space-y-10">
          {orderedSets.map(([album, list]) => {
            const got = list.filter((c) => mine.get(c.id)?.status === "approved").length;
            const meta = pokedexSets[album];
            return (
              <section key={album}>
                <div className="mb-3 border-b-2 border-lilac-500 pb-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-bold">
                      {album}
                      {!source && <span className="ml-2 text-xs font-semibold text-lilac-500">{sourceOf(list[0])}</span>}
                    </h2>
                    <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                      {got} / {list.length}
                    </span>
                  </div>
                  {meta && (
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {meta.how}
                      {meta.note && <span className="block text-[11px] text-ink-soft/80">※ {meta.note}</span>}
                      {meta.link && (
                        <a href={meta.link} target="_blank" rel="noopener noreferrer" className="ml-1.5 underline hover:text-ink">
                          출처 ↗
                        </a>
                      )}
                    </p>
                  )}
                </div>
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                  {list.map((card) => (
                    <li key={card.id}>
                      <CardTile card={card} entry={mine.get(card.id)} />
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
