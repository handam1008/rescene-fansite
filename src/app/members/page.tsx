import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteSummary, FavoriteToggle, FavoritesProvider } from "@/components/FavoriteMembers";
import { MemberAvatar } from "@/components/MemberHeader";
import { PageHeader } from "@/components/ui";
import { members, nameOf, noteOf, type MemberSlug } from "@/data/members";
import { PULSE_PHOTO_CREDIT } from "@/data/site";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.members.title };
}

export default async function MembersPage() {
  const { m, locale } = await getI18n();
  return (
    <>
      <PageHeader
        eyebrow="My Favorite"
        title={m.members.title}
        description={m.members.desc}
      />
      <FavoritesProvider>
        <FavoriteSummary />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {members.map((mem) => (
            <li key={mem.slug} className="card flex flex-col">
              <Link href={`/members/${mem.slug}`} className="flex flex-1 flex-col items-center gap-3 p-5 text-center hover:bg-lilac-50">
                <MemberAvatar member={mem} size={112} locale={locale} />
                <div>
                  <p className="text-lg font-extrabold">{nameOf(mem, locale)}</p>
                  {/* 영어 화면에서는 이름이 이미 영어라 한국어 이름을 작게 */}
                  <p className="text-xs tracking-wider text-ink-soft uppercase">{locale === "en" ? mem.name : mem.english}</p>
                </div>
                {mem.note && (
                  <span className="bg-lilac-100 px-2 py-0.5 text-xs font-semibold text-lilac-700">{noteOf(mem, locale)}</span>
                )}
              </Link>
              <div className="border-t border-lilac-100 p-2.5">
                <FavoriteToggle slug={mem.slug as MemberSlug} name={nameOf(mem, locale)} />
              </div>
            </li>
          ))}
        </ul>
      </FavoritesProvider>
      <p className="mt-4 text-right text-[11px] text-ink-soft">{PULSE_PHOTO_CREDIT[locale]}</p>
    </>
  );
}
