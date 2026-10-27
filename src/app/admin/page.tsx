import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CardImage from "@/components/CardImage";
import CatalogForm from "@/components/CatalogForm";
import CatalogImageButton from "@/components/CatalogImageButton";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { pokedexMemberName } from "@/data/members";
import { cardSourceUrl } from "@/data/pokedex-sets";
import { getCatalog, getPendingProofs, proofImageUrls } from "@/lib/community";
import type { CatalogCard } from "@/types";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { approveProof, deleteCatalogCard, rejectProof, updateSetSourceUrl } from "./actions";

export const metadata: Metadata = { title: "운영자", robots: { index: false } };

export const dynamic = "force-dynamic";

function groupBySet(cards: CatalogCard[]) {
  const sets = new Map<string, CatalogCard[]>();
  for (const c of cards) {
    const key = `${c.source ?? "앨범"} · ${c.album}`;
    sets.set(key, [...(sets.get(key) ?? []), c]);
  }
  return sets;
}

/** 지금까지 나온 앨범 (도감 등록할 때 고르기 쉽게) */
const KNOWN_ALBUMS = ["Re:Scene", "Dearest", "SCENEDROME", "Glow Up", "lip bomb", "PULSE", "CU 리센느빵 2탄"];

export default async function AdminPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) {
    return <EmptyState>운영자만 들어올 수 있는 페이지예요.</EmptyState>;
  }

  const [pending, catalog] = await Promise.all([getPendingProofs(), getCatalog()]);
  const proofUrls = await proofImageUrls(pending.map((p) => p.photo_path));
  const albums = [...new Set([...KNOWN_ALBUMS, ...catalog.map((c) => c.album)])];

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Admin" title="운영자" description="포카 인증을 확인하고, 도감에 공식 포토카드를 등록해요." />

      {/* 인증 확인 */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">
          인증 대기 <span className="text-lilac-500">{pending.length}</span>건
        </h2>
        {pending.length === 0 ? (
          <EmptyState>확인할 인증이 없어요.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex gap-3">
                  <figure className="w-28 shrink-0">
                    {p.photocard_catalog && <CardImage card={p.photocard_catalog} />}
                    <figcaption className="mt-1 text-center text-[11px] text-ink-soft">도감 카드</figcaption>
                  </figure>
                  <figure className="w-40 shrink-0">
                    {proofUrls.get(p.photo_path) ? (
                      <a href={proofUrls.get(p.photo_path)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- 비공개 인증 사진(임시 주소) */}
                        <img src={proofUrls.get(p.photo_path)} alt="회원 인증 사진" className="max-h-60 w-full border border-lilac-200 object-contain" />
                      </a>
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-lilac-50 text-xs text-ink-soft">사진을 불러오지 못했어요</div>
                    )}
                    <figcaption className="mt-1 text-center text-[11px] text-ink-soft">회원이 찍은 사진 (누르면 크게)</figcaption>
                  </figure>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
                  <p>
                    <b>{p.profiles?.nickname ?? "알 수 없음"}</b>
                    <span className="ml-2 text-xs text-ink-soft">{formatFullDateTime(p.created_at)}</span>
                  </p>
                  {p.photocard_catalog && (
                    <p className="text-ink-soft">
                      {p.photocard_catalog.album} · {pokedexMemberName(p.photocard_catalog.member)}
                      {p.photocard_catalog.label && ` · ${p.photocard_catalog.label}`}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-end gap-2">
                    <form action={approveProof}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="border border-lilac-500 bg-lilac-500 px-4 py-1.5 font-bold text-white hover:bg-lilac-700">
                        승인
                      </button>
                    </form>
                    <form action={approveProof}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="useAsImage" value="1" />
                      <button
                        type="submit"
                        className={`border px-3 py-1.5 font-bold ${
                          p.photocard_catalog?.image_path
                            ? "border-lilac-200 bg-white text-ink-soft hover:bg-lilac-50"
                            : "border-lilac-500 bg-white text-lilac-700 hover:bg-lilac-50"
                        }`}
                      >
                        {p.photocard_catalog?.image_path ? "승인 + 도감 이미지 교체" : "승인 + 도감 이미지로 쓰기"}
                      </button>
                    </form>
                    <form action={rejectProof} className="flex flex-1 gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="reason"
                        maxLength={200}
                        placeholder="반려 사유 (비우면 기본 문구)"
                        className="min-w-0 flex-1 border border-lilac-200 px-2 py-1.5 text-sm"
                      />
                      <button type="submit" className="border border-lilac-200 bg-white px-3 py-1.5 hover:bg-lilac-50">
                        반려
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 도감 카드 등록 */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">도감에 카드 등록</h2>
        <div className="card p-5">
          <CatalogForm albums={albums} />
        </div>
      </section>

      {/* 등록된 카드 (세트별) */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">
          등록된 카드 <span className="text-lilac-500">{catalog.length}</span>장
          <span className="ml-2 text-xs font-normal text-ink-soft">
            이미지 없는 카드 {catalog.filter((c) => !c.image_path).length}장
          </span>
        </h2>
        {catalog.length === 0 ? (
          <EmptyState>아직 등록된 카드가 없어요.</EmptyState>
        ) : (
          <div className="space-y-2">
            {[...groupBySet(catalog).entries()].map(([set, cards]) => (
              <details key={set} className="card">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                  {set} <span className="font-normal text-ink-soft">· {cards.length}장 (이미지 없음 {cards.filter((c) => !c.image_path).length})</span>
                </summary>
                <form action={updateSetSourceUrl} className="flex gap-2 border-t border-lilac-100 px-4 pt-3 text-xs">
                  <input type="hidden" name="source" value={cards[0].source ?? "앨범"} />
                  <input type="hidden" name="album" value={cards[0].album} />
                  <input
                    name="url"
                    type="url"
                    maxLength={500}
                    defaultValue={cardSourceUrl(cards[0]) ?? ""}
                    placeholder="공식 공지·기사 링크 (https://…)"
                    aria-label="세트 출처 링크"
                    className="min-w-0 flex-1 border border-lilac-200 px-2 py-1.5"
                  />
                  <button type="submit" className="shrink-0 border border-lilac-200 bg-white px-3 py-1.5 hover:bg-lilac-50">
                    출처 링크 저장
                  </button>
                </form>
                <ul className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
                  {cards.map((c) => (
                    <li key={c.id} className="text-xs">
                      <CardImage card={c} />
                      <p className="mt-1 truncate font-semibold">{pokedexMemberName(c.member)}</p>
                      {c.label && <p className="truncate text-ink-soft">{c.label}</p>}
                      <div className="mt-0.5 flex gap-2">
                        <CatalogImageButton cardId={c.id} current={c.image_path} />
                        <form action={deleteCatalogCard}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-ink-soft underline hover:text-ink">
                            삭제
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
