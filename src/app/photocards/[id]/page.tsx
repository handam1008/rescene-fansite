import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardImage from "@/components/CardImage";
import ProofForm from "@/components/ProofForm";
import { SupabaseNotice } from "@/components/ui";
import { pokedexMemberName } from "@/data/members";
import { pokedexSets } from "@/data/pokedex-sets";
import { getCatalogCard, getMyCollections, proofImageUrls } from "@/lib/community";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { cancelProof } from "../actions";

export const metadata: Metadata = { title: "포카 도감" };

// 내 인증 상태를 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function PhotocardPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [card, user] = await Promise.all([getCatalogCard(id), getCurrentUser()]);
  if (!card) notFound();

  const entry = (await getMyCollections(user?.id)).get(card.id);
  const proofUrl = entry ? (await proofImageUrls([entry.photo_path])).get(entry.photo_path) : undefined;
  const memberName = pokedexMemberName(card.member);

  return (
    <div className="space-y-5">
      <Link href="/photocards" className="text-sm text-lilac-700 underline">
        ← 도감으로
      </Link>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
        <div className="mx-auto w-full max-w-[280px]">
          <CardImage card={card} className={entry?.status === "approved" ? "" : "grayscale-[60%]"} />
        </div>

        <div>
          <p className="text-sm font-semibold text-lilac-700">
            {card.source && card.source !== "앨범" && <span className="mr-1.5 text-ink-soft">{card.source} ·</span>}
            {card.album}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {memberName}
            {card.label && <span className="ml-2 text-lg font-semibold text-ink-soft">{card.label}</span>}
          </h1>

          {pokedexSets[card.album] && <p className="mt-2 text-xs leading-relaxed text-ink-soft">{pokedexSets[card.album].how}</p>}

          <div className="card mt-5 p-5">
            {!user ? (
              <p className="text-sm">
                <Link href={`/login?next=/photocards/${card.id}`} className="font-semibold text-lilac-700 underline">
                  로그인
                </Link>
                하면 이 카드를 인증할 수 있어요.
              </p>
            ) : entry?.status === "approved" ? (
              <div>
                <p className="text-lg font-extrabold text-lilac-700">✓ 수집 완료</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {entry.reviewed_at && `${formatFullDateTime(entry.reviewed_at)} 확인됨`}
                </p>
              </div>
            ) : entry?.status === "pending" ? (
              <div className="space-y-3">
                <p className="font-bold text-sky-700">운영자가 확인하고 있어요</p>
                {proofUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- 비공개 인증 사진(임시 주소)
                  <img src={proofUrl} alt="내가 올린 인증 사진" className="max-h-56 border border-lilac-200" />
                )}
                <form action={cancelProof}>
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="cardId" value={card.id} />
                  <button type="submit" className="text-xs text-ink-soft underline hover:text-ink">
                    인증 취소
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {entry?.status === "rejected" && (
                  <p className="border border-blush-400 bg-blush-100 px-3 py-2 text-sm">
                    인증이 반려됐어요: {entry.reject_reason ?? "다시 찍어서 올려주세요."}
                  </p>
                )}
                <p className="text-sm font-semibold">이 카드를 가지고 있나요?</p>
                <ProofForm
                  userId={user.id}
                  cardId={card.id}
                  previous={entry ? { id: entry.id, photo_path: entry.photo_path } : undefined}
                />
                <p className="text-xs text-ink-soft">
                  인증 사진은 나와 운영자만 볼 수 있어요. 아직 도감 이미지가 없는 카드라면, 승인된 사진이 카드 부분만
                  도감 이미지로 쓰일 수 있어요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
