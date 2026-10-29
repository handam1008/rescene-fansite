"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthStatus from "./AuthStatus";
import { ChevronDownIcon } from "./Icons";
import { LiveStrip } from "./LiveStatus";
import { useI18n } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";

type NavLink = { label: string; href: string; desc?: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

/** PC 에서는 컴백·신곡·투표·LIVE 를 "소식" 아래로 묶어 메뉴를 6개로 줄임 (휴대폰은 전부 펼쳐서 가로 스크롤) */
function navItems(m: Messages): NavItem[] {
  return [
    { label: m.nav.home, href: "/" },
    { label: m.nav.schedule, href: "/schedule" },
    { label: m.nav.favorite, href: "/members" },
    {
      label: m.nav.news,
      children: [
        { label: m.nav.comeback, href: "/comeback", desc: m.nav.comebackDesc },
        { label: m.nav.songs, href: "/songs", desc: m.nav.songsDesc },
        { label: m.nav.votes, href: "/votes", desc: m.nav.votesDesc },
        { label: m.nav.live, href: "/live", desc: m.nav.liveDesc },
      ],
    },
    { label: m.nav.photocards, href: "/photocards" },
    { label: m.nav.board, href: "/board" },
  ];
}

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export default function Header() {
  const pathname = usePathname();
  const { m } = useI18n();
  const items = navItems(m);
  const flatItems: NavLink[] = items.flatMap((item) => ("children" in item ? item.children : [item]));
  const mobileNav = useRef<HTMLElement>(null);

  // 휴대폰 메뉴 줄: 지금 페이지 메뉴가 화면 밖에 있으면 보이게 밀어줌 (예: 게시판)
  useEffect(() => {
    const box = mobileNav.current;
    const el = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !el) return;
    if (el.offsetLeft < box.scrollLeft || el.offsetLeft + el.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollLeft = el.offsetLeft - 8;
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-lilac-200/70 bg-white/80 backdrop-blur-md">
      {/* 스크롤을 따라 내려오는 반투명 헤더 (뒤 내용이 살짝 비쳐 보임) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 xl:h-[72px] xl:gap-8 xl:px-6 wide:max-w-[1520px]">
        <div className="flex min-w-0 items-center gap-6 xl:h-full">
          {/* 좁은 휴대폰에서는 "팬사이트"를 작게 아랫줄로 (오른쪽 버튼 자리 확보) */}
          <Link
            href="/"
            className="text-dreamy font-display shrink-0 py-1.5 text-xl leading-[1.1] font-extrabold tracking-wide whitespace-nowrap sm:py-3 xl:py-0 xl:text-2xl"
          >
            RESCENE ✦<br className="sm:hidden" />
            <span className="text-[13px] tracking-[0.3em] sm:text-[1em] sm:tracking-wide"> {m.nav.logoSuffix}</span>
          </Link>

          {/* PC: 한 줄 큰 메뉴 */}
          <nav aria-label={m.nav.mainMenu} className="hidden h-full xl:block">
            <ul className="flex h-full items-stretch">
              {items.map((item) =>
                "children" in item ? (
                  <li key={item.label} className="flex">
                    <NavGroup label={item.label} items={item.children} pathname={pathname} />
                  </li>
                ) : (
                  <li key={item.label} className="flex">
                    <TopLink item={item} active={isActive(pathname, item.href)} />
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>

        <AuthStatus />
      </div>

      {/* 휴대폰·태블릿: 둘째 줄에 메뉴 전부 (가로로 밀어서 보기) */}
      <nav
        ref={mobileNav}
        aria-label={m.nav.mainMenu}
        className="no-scrollbar relative overflow-x-auto border-t border-lilac-100 xl:hidden">
        <ul className="flex gap-1 px-2 whitespace-nowrap">
          {flatItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block border-b-[3px] px-3 py-2.5 text-[15px] font-semibold ${
                    active ? "border-lilac-500 text-lilac-700" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* 방송 중이거나 곧 시작하면 빨간 LIVE 줄 (헤더와 같이 따라 내려옴) */}
      <LiveStrip />
    </header>
  );
}

/** PC 메뉴 한 칸. 지금 페이지면 보라색 글자 + 헤더 아래 테두리에 굵은 밑줄 */
function TopLink({ item, active }: { item: NavLink; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center px-3.5 text-[17px] font-bold transition-colors ${
        active ? "text-lilac-700" : "text-ink hover:text-lilac-700"
      }`}
    >
      {item.label}
      {active && <span className="absolute inset-x-3 -bottom-px h-[3px] bg-lilac-500" />}
    </Link>
  );
}

/**
 * "소식 ▾": 마우스를 올리거나 누르면 아래로 펼쳐짐. 바깥을 누르거나 Esc·Tab 으로 벗어나면 닫힘.
 * 마우스 올림은 진짜 마우스일 때만 (태블릿은 터치하면 올림+누름이 같이 와서 열리자마자 닫혀 버림)
 */
function NavGroup({ label, items, pathname }: { label: string; items: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = items.some((i) => isActive(pathname, i.href));

  // 다른 페이지로 넘어가면 닫기
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // 펼친 메뉴 안에 있던 키보드 위치를 "소식" 버튼으로 돌려놓음
      if (ref.current?.contains(document.activeElement)) ref.current.querySelector("button")?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1 px-3.5 text-[17px] font-bold transition-colors hover:transform-none active:transform-none ${
          active || open ? "text-lilac-700" : "text-ink hover:text-lilac-700"
        }`}
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        {active && <span className="absolute inset-x-3 -bottom-px h-[3px] bg-lilac-500" />}
      </button>

      {open && (
        <ul className="card absolute top-full left-1/2 w-56 -translate-x-1/2 py-1.5 shadow-lg shadow-lilac-200/60">
          {items.map((item) => {
            const here = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={here ? "page" : undefined}
                  className={`block px-4 py-2.5 hover:bg-lilac-50 ${here ? "bg-lilac-50" : ""}`}
                >
                  <span className={`block text-[15px] font-bold ${here ? "text-lilac-700" : "text-ink"}`}>{item.label}</span>
                  {item.desc && <span className="block text-xs text-ink-soft">{item.desc}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
