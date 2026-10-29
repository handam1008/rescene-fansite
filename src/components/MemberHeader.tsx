import Image from "next/image";
import Link from "next/link";
import { members, nameOf, type Member, type MemberSlug } from "@/data/members";
import { fmt, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { FavoriteToggle, FavoritesProvider } from "./FavoriteMembers";

/** 멤버 사진 (사진이 없으면 멤버 색 네모에 이름 첫 글자) */
export function MemberAvatar({ member, size = 64, locale = "ko" }: { member: Member; size?: number; locale?: Locale }) {
  // 사진 칸은 비워둘 수도 있어서 string 으로 넓혀서 확인
  const image: string = member.image;
  if (image) {
    return (
      <Image
        src={image}
        alt={nameOf(member, locale)}
        width={size}
        height={size}
        className="shrink-0 object-cover"
        // 멤버 색으로 테두리
        style={{ width: size, height: size, boxShadow: `0 0 0 3px ${member.color}` }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center font-black text-ink"
      style={{ width: size, height: size, backgroundColor: member.color, fontSize: size * 0.4 }}
    >
      {nameOf(member, locale)[0]}
    </span>
  );
}

/** 멤버 페이지 위쪽: 멤버 바꾸기 + 이름 + 탭(프로필·일정 / 게시판) */
export default async function MemberHeader({ member, active }: { member: Member; active: "profile" | "board" }) {
  const { m, locale } = await getI18n();
  const name = nameOf(member, locale);
  const tabs = [
    { key: "profile", label: m.members.tabProfile, href: `/members/${member.slug}` },
    { key: "board", label: fmt(m.members.tabBoard, { name }), href: `/members/${member.slug}/board` },
  ] as const;

  return (
    <div className="mb-6">
      <nav aria-label={m.members.memberSelect} className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-1.5 whitespace-nowrap">
          {members.map((mem) => (
            <li key={mem.slug}>
              <Link
                href={active === "board" ? `/members/${mem.slug}/board` : `/members/${mem.slug}`}
                aria-current={mem.slug === member.slug ? "page" : undefined}
                className={`flex items-center gap-1.5 border px-2.5 py-1 text-sm ${
                  mem.slug === member.slug ? "border-lilac-500 bg-white font-bold" : "border-lilac-200 bg-white/70 text-ink-soft hover:bg-white"
                }`}
              >
                <span aria-hidden className="h-2.5 w-2.5" style={{ backgroundColor: mem.color }} />
                {nameOf(mem, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <MemberAvatar member={member} size={72} locale={locale} />
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-lilac-500 uppercase">{locale === "en" ? member.name : member.english}</p>
          <h1 className="text-3xl font-extrabold">{name}</h1>
        </div>
        <div className="ml-auto">
          <FavoritesProvider>
            <FavoriteToggle slug={member.slug as MemberSlug} name={name} compact />
          </FavoritesProvider>
        </div>
      </div>

      <div className="mt-5 flex border-b-2 border-lilac-500">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={t.key === active ? "page" : undefined}
            className={`px-4 py-2 text-sm font-bold ${t.key === active ? "bg-lilac-500 text-white" : "text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
