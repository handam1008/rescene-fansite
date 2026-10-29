import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BanNotice from "@/components/BanNotice";
import CardImage from "@/components/CardImage";
import ProofForm from "@/components/ProofForm";
import { SupabaseNotice } from "@/components/ui";
import { pokedexMemberName } from "@/data/members";
import { cardLabel, cardSourceUrl, setInfo, setName, sourceName } from "@/data/pokedex-sets";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCatalogCard, getMyCollections, getNicknames, proofImageUrls } from "@/lib/community";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { cancelProof } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.pokedex.title };
}

// 내 인증 상태를 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function PhotocardPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [card, user] = await Promise.all([getCatalogCard(id), getCurrentUser()]);
  if (!card) notFound();

  const [collections, names] = await Promise.all([
    getMyCollections(user?.id),
    getNicknames([card.first_contributor, card.image_contributor]),
  ]);
  const firstName = card.first_contributor ? names.get(card.first_contributor) : undefined;
  // 사진이 교체돼 지금 사진을 찍은 사람이 첫 제공자와 다를 때
  const photoName =
    card.image_path && card.image_contributor && card.image_contributor !== card.first_contributor
      ? names.get(card.image_contributor)
      : undefined;
  const entry = collections.get(card.id);
  const proofUrl = entry ? (await proofImageUrls([entry.photo_path])).get(entry.photo_path) : undefined;
  const { m, locale } = await getI18n();
  const memberName = pokedexMemberName(card.member, locale);
  const setDesc = setInfo(card.album, locale);
  const sourceUrl = cardSourceUrl(card);

  return (
    <div className="space-y-5">
      <Link href="/photocards" className="text-sm text-lilac-700 underline">
        {m.pokedex.back}
      </Link>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
        <div className="mx-auto w-full max-w-[280px]">
          <CardImage card={card} />
          {firstName && (
            <p className="mt-1.5 text-center text-xs text-lilac-700">
              {fmt(m.pokedex.firstBy, { name: firstName })}
            </p>
          )}
          {photoName && <p className="text-center text-xs text-ink-soft">{fmt(m.pokedex.photoBy, { name: photoName })}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold text-lilac-700">
            {card.source && card.source !== "앨범" && <span className="mr-1.5 text-ink-soft">{sourceName(card.source, locale)} ·</span>}
            {setName(card.album, locale)}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {memberName}
            {card.label && <span className="ml-2 text-lg font-semibold text-ink-soft">{cardLabel(card.label, locale)}</span>}
          </h1>

          {(setDesc || sourceUrl) && (
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {setDesc?.how}
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1.5 font-semibold text-lilac-700 underline hover:text-ink">
                  {m.pokedex.sourceSee}
                </a>
              )}
            </p>
          )}

          {!card.image_path && entry?.status !== "approved" && (
            <div className="mt-4 border border-lilac-500 bg-lilac-50 px-4 py-3 text-sm">
              <p className="font-bold text-lilac-700">{m.pokedex.nobodyTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{m.pokedex.nobodyDesc}</p>
            </div>
          )}

          <div className="card mt-5 p-5">
            {!user ? (
              <p className="text-sm">
                <Link href={`/login?next=/photocards/${card.id}`} className="font-semibold text-lilac-700 underline">
                  {m.pokedex.login}
                </Link>
                {m.pokedex.loginToSubmit}
              </p>
            ) : user.bannedUntil && entry?.status !== "approved" ? (
              <BanNotice until={user.bannedUntil} reason={user.banReason} />
            ) : entry?.status === "approved" ? (
              <div>
                <p className="text-lg font-extrabold text-lilac-700">{m.pokedex.collected}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {entry.reviewed_at && fmt(m.pokedex.reviewedAt, { date: formatFullDateTime(entry.reviewed_at) })}
                </p>
              </div>
            ) : entry?.status === "pending" ? (
              <div className="space-y-3">
                <p className="font-bold text-sky-700">{m.pokedex.reviewing}</p>
                {proofUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- 비공개 인증 사진(임시 주소)
                  <img src={proofUrl} alt={m.pokedex.myProofAlt} className="max-h-56 border border-lilac-200" />
                )}
                <form action={cancelProof}>
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="cardId" value={card.id} />
                  <button type="submit" className="text-xs text-ink-soft underline hover:text-ink">
                    {m.pokedex.cancelProof}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {entry?.status === "rejected" && (
                  <p className="border border-blush-400 bg-blush-100 px-3 py-2 text-sm">
                    {fmt(m.pokedex.rejected, { reason: entry.reject_reason ?? m.pokedex.rejectedDefault })}
                  </p>
                )}
                <p className="text-sm font-semibold">{m.pokedex.haveIt}</p>
                <ProofForm
                  userId={user.id}
                  cardId={card.id}
                  previous={entry ? { id: entry.id, photo_path: entry.photo_path } : undefined}
                  cardHasImage={!!card.image_path}
                />
                <p className="text-xs text-ink-soft">{m.pokedex.privacyNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
