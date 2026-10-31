"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isActive, navItems, type NavLink } from "./Header";
import { useI18n } from "@/i18n/client";

const icon = (d: ReactNode) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    {d}
  </svg>
);

const ICONS = {
  home: icon(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  schedule: icon(
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>,
  ),
  guide: icon(<path d="M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11" />),
  board: icon(<path d="M4 5h16v11H9l-5 4z" />),
  menu: icon(<path d="M4 7h16M4 12h16M4 17h16" />),
};

/**
 * 휴대폰 화면 아래에 고정된 메뉴 (앱처럼 엄지로 누르기 쉽게).
 * 자주 쓰는 4곳 + "전체"를 누르면 나머지 메뉴가 아래에서 올라옴. 태블릿·PC 는 위쪽 메뉴를 씀
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { m } = useI18n();
  const [open, setOpen] = useState(false);

  const main = [
    { href: "/", label: m.nav.home, icon: ICONS.home },
    { href: "/schedule", label: m.nav.schedule, icon: ICONS.schedule },
    { href: "/guide", label: m.nav.guideShort, icon: ICONS.guide },
    { href: "/board", label: m.nav.board, icon: ICONS.board },
  ];
  const all: NavLink[] = navItems(m).flatMap((item) => ("children" in item ? item.children : [item]));
  const inMain = main.some((t) => isActive(pathname, t.href));

  // 다른 페이지로 넘어가면 닫고, 열려 있는 동안은 Esc 로 닫기 + 뒤 화면 스크롤 막기
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const tab = "flex flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 text-[11px] font-semibold";

  return (
    <div className="sm:hidden">
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/30" onClick={() => setOpen(false)}>
          <nav
            aria-label={m.nav.menuTitle}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto border-t border-lilac-200 bg-white px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold">{m.nav.menuTitle}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label={m.nav.closeMenu} className="px-2 py-1 text-xl text-ink-soft">
                ✕
              </button>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {all.map((item) => {
                const here = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={here ? "page" : undefined}
                      className={`block h-full border-2 px-3 py-2.5 ${here ? "border-lilac-300 bg-lilac-50" : "border-lilac-100"}`}
                    >
                      <span className={`block text-[15px] font-bold ${here ? "text-lilac-700" : "text-ink"}`}>{item.label}</span>
                      {item.desc && <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{item.desc}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      <nav
        aria-label={m.nav.mainMenu}
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-lilac-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        {main.map((t) => {
          const here = !open && isActive(pathname, t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={here ? "page" : undefined} className={`${tab} ${here ? "text-lilac-700" : "text-ink-soft"}`}>
              {t.icon}
              {t.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`${tab} ${open || !inMain ? "text-lilac-700" : "text-ink-soft"}`}
        >
          {ICONS.menu}
          {m.nav.menu}
        </button>
      </nav>
    </div>
  );
}
