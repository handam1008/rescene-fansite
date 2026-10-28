import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteSummary, FavoriteToggle, FavoritesProvider } from "@/components/FavoriteMembers";
import { MemberAvatar } from "@/components/MemberHeader";
import { PageHeader } from "@/components/ui";
import { members, type MemberSlug } from "@/data/members";

export const metadata: Metadata = { title: "최애" };

export default function MembersPage() {
  return (
    <>
      <PageHeader
        eyebrow="My Favorite"
        title="최애"
        description="최애 멤버를 골라주세요. 여러 명도 괜찮고 언제든 바꿀 수 있어요. 멤버를 누르면 프로필·개인 일정·멤버 게시판을 볼 수 있어요."
      />
      <FavoritesProvider>
        <FavoriteSummary />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {members.map((m) => (
            <li key={m.slug} className="card flex flex-col">
              <Link href={`/members/${m.slug}`} className="flex flex-1 flex-col items-center gap-3 p-5 text-center hover:bg-lilac-50">
                <MemberAvatar member={m} size={88} />
                <div>
                  <p className="text-lg font-extrabold">{m.name}</p>
                  <p className="text-xs tracking-wider text-ink-soft uppercase">{m.english}</p>
                </div>
                {m.note && <span className="bg-lilac-100 px-2 py-0.5 text-xs font-semibold text-lilac-700">{m.note}</span>}
              </Link>
              <div className="border-t border-lilac-100 p-2.5">
                <FavoriteToggle slug={m.slug as MemberSlug} name={m.name} />
              </div>
            </li>
          ))}
        </ul>
      </FavoritesProvider>
    </>
  );
}
