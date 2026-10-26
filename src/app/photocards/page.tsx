import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader, SupabaseNotice, buttonClass } from "@/components/ui";
import { photocardMembers } from "@/data/members";
import { getPhotocards, photocardImageUrl } from "@/lib/community";
import { formatDate } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { deletePhotocard } from "./actions";

export const metadata: Metadata = { title: "포카" };

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function PhotocardsPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader eyebrow="Photocard" title="포카" />
        <SupabaseNotice />
      </>
    );
  }

  const { member } = await searchParams;
  const selected = photocardMembers.find((m) => m === member);
  const [cards, user] = await Promise.all([getPhotocards(selected), getCurrentUser()]);

  const filters = [{ label: "전체", href: "/photocards", active: !selected }].concat(
    photocardMembers.map((m) => ({
      label: m,
      href: `/photocards?member=${encodeURIComponent(m)}`,
      active: m === selected,
    })),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader eyebrow="Photocard" title="포카" description="리마인들이 모은 포토카드를 구경해요." />
        <Link href={user ? "/photocards/new" : "/login?next=/photocards/new"} className={`${buttonClass} mb-6 sm:mb-8`}>
          + 포카 올리기
        </Link>
      </div>

      <nav aria-label="멤버 필터" className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-1.5 whitespace-nowrap">
          {filters.map((f) => (
            <li key={f.label}>
              <Link
                href={f.href}
                className={`block border px-3 py-1 text-sm ${
                  f.active ? "border-lilac-500 bg-lilac-200 font-semibold" : "border-lilac-200 bg-white hover:bg-lilac-100"
                }`}
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {cards.length === 0 ? (
        <EmptyState>아직 올라온 포카가 없어요. 첫 포카를 올려주세요!</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 이미지 */}
              <img
                src={photocardImageUrl(card.image_path)}
                alt={`${card.member} 포카${card.album ? ` (${card.album})` : ""}`}
                loading="lazy"
                className="aspect-[55/85] w-full bg-lilac-50 object-cover"
              />
              <div className="space-y-0.5 p-3">
                <p className="text-sm font-bold">
                  {card.member}
                  {card.album && <span className="font-normal text-ink-soft"> · {card.album}</span>}
                </p>
                {card.description && <p className="text-xs break-words">{card.description}</p>}
                <p className="text-[11px] text-ink-soft">
                  {card.profiles?.nickname ?? "알 수 없음"} · {formatDate(card.created_at)}
                </p>
                {user?.id === card.user_id && (
                  <form action={deletePhotocard}>
                    <input type="hidden" name="id" value={card.id} />
                    <button type="submit" className="text-[11px] text-ink-soft underline hover:text-ink">
                      삭제
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
