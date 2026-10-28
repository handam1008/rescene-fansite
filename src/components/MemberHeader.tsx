import Image from "next/image";
import Link from "next/link";
import { members, type Member, type MemberSlug } from "@/data/members";
import { FavoriteToggle, FavoritesProvider } from "./FavoriteMembers";

/** 멤버 사진 (사진이 없으면 멤버 색 네모에 이름 첫 글자) */
export function MemberAvatar({ member, size = 64 }: { member: Member; size?: number }) {
  if (member.image) {
    return (
      <Image
        src={member.image}
        alt={`${member.name} 사진`}
        width={size}
        height={size}
        className="shrink-0 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center font-black text-ink"
      style={{ width: size, height: size, backgroundColor: member.color, fontSize: size * 0.4 }}
    >
      {member.name[0]}
    </span>
  );
}

/** 멤버 페이지 위쪽: 멤버 바꾸기 + 이름 + 탭(프로필·일정 / 게시판) */
export default function MemberHeader({ member, active }: { member: Member; active: "profile" | "board" }) {
  const tabs = [
    { key: "profile", label: "프로필 · 일정", href: `/members/${member.slug}` },
    { key: "board", label: `${member.name} 게시판`, href: `/members/${member.slug}/board` },
  ] as const;

  return (
    <div className="mb-6">
      <nav aria-label="멤버 선택" className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-1.5 whitespace-nowrap">
          {members.map((m) => (
            <li key={m.slug}>
              <Link
                href={active === "board" ? `/members/${m.slug}/board` : `/members/${m.slug}`}
                aria-current={m.slug === member.slug ? "page" : undefined}
                className={`flex items-center gap-1.5 border px-2.5 py-1 text-sm ${
                  m.slug === member.slug ? "border-lilac-500 bg-white font-bold" : "border-lilac-200 bg-white/70 text-ink-soft hover:bg-white"
                }`}
              >
                <span aria-hidden className="h-2.5 w-2.5" style={{ backgroundColor: m.color }} />
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <MemberAvatar member={member} size={72} />
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-lilac-500 uppercase">{member.english}</p>
          <h1 className="text-3xl font-extrabold">{member.name}</h1>
        </div>
        <div className="ml-auto">
          <FavoritesProvider>
            <FavoriteToggle slug={member.slug as MemberSlug} name={member.name} compact />
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
