"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthStatus from "./AuthStatus";

type NavItem = { label: string; href?: string };

/** href가 없는 메뉴는 "준비 중"으로 표시됩니다. 페이지를 만들면 href만 추가하세요. */
const navItems: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "일정", href: "/schedule" },
  { label: "멤버", href: "/members" },
  { label: "컴백", href: "/comeback" },
  { label: "신곡", href: "/songs" },
  { label: "투표", href: "/votes" },
  { label: "포카도감", href: "/photocards" },
  { label: "게시판", href: "/board" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-lilac-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-dreamy text-lg font-extrabold tracking-wide whitespace-nowrap sm:text-xl">
            RESCENE ✦ 팬사이트
          </Link>
          <div className="sm:hidden">
            <AuthStatus />
          </div>
        </div>
        <nav aria-label="주요 메뉴" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-1.5 whitespace-nowrap">
            {navItems.map((item) => {
              if (!item.href) {
                return (
                  <li key={item.label}>
                    <span
                      aria-disabled="true"
                      title="준비 중이에요"
                      className="flex cursor-not-allowed items-center gap-1 px-3 py-1.5 text-sm text-ink-soft/60"
                    >
                      {item.label}
                      <span className="bg-lilac-100 px-1.5 py-0.5 text-[10px] font-medium text-lilac-500">
                        준비 중
                      </span>
                    </span>
                  </li>
                );
              }
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3.5 py-1.5 text-sm font-medium transition ${
                      active
                        ? "border-b-2 border-lilac-500 text-ink"
                        : "border-b-2 border-transparent text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden sm:block">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
