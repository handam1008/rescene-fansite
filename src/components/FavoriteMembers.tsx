"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { members, nameOf, type MemberSlug } from "@/data/members";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { HeartIcon } from "./Icons";

/*
 * 최애 멤버 고르기 (0012 SQL). 여러 명 고를 수 있고 다시 누르면 취소.
 * 로그인 상태와 내 최애는 브라우저에서 불러와서, 멤버 페이지는 정적인 빠른 페이지로 유지.
 * FavoritesProvider 안의 버튼·요약은 같은 상태를 나눠 씀 (하나를 누르면 요약도 바로 바뀜)
 */

type FavoritesState = {
  /** undefined: 확인 중, null: 로그인 안 함 */
  userId: string | null | undefined;
  favs: Set<MemberSlug>;
  pending: Set<MemberSlug>;
  error: string;
  toggle: (slug: MemberSlug) => void;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

const flip = (set: Set<MemberSlug>, slug: MemberSlug) => {
  const next = new Set(set);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  return next;
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [favs, setFavs] = useState<Set<MemberSlug>>(new Set());
  const [pending, setPending] = useState<Set<MemberSlug>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let alive = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? null;
      if (id) {
        const { data: rows } = await supabase.from("favorite_members").select("member_slug");
        if (alive) setFavs(new Set((rows ?? []).map((r) => r.member_slug as MemberSlug)));
      }
      if (alive) setUserId(id);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function toggle(slug: MemberSlug) {
    if (!userId || pending.has(slug)) return;
    const wasOn = favs.has(slug);
    // 응답을 기다리지 않고 바로 바꿔 보여주고, 실패하면 되돌림
    setFavs((s) => flip(s, slug));
    setPending((s) => new Set(s).add(slug));
    setError("");
    const supabase = createClient();
    const { error: err } = wasOn
      ? await supabase.from("favorite_members").delete().eq("member_slug", slug)
      : await supabase.from("favorite_members").insert({ member_slug: slug });
    // 23505: 이미 고른 상태 (다른 탭에서 먼저 누른 경우) → 성공과 같음
    if (err && err.code !== "23505") {
      setFavs((s) => flip(s, slug));
      setError("save");
    }
    setPending((s) => {
      const next = new Set(s);
      next.delete(slug);
      return next;
    });
  }

  return (
    <FavoritesContext.Provider value={{ userId, favs, pending, error, toggle }}>{children}</FavoritesContext.Provider>
  );
}

function useFavorites() {
  const v = useContext(FavoritesContext);
  if (!v) throw new Error("FavoritesProvider 안에서 써야 해요");
  return v;
}

/** 멤버 하나의 최애 버튼. compact: 멤버 페이지 이름 옆에 놓는 작은 버튼 */
export function FavoriteToggle({ slug, name, compact = false }: { slug: MemberSlug; name: string; compact?: boolean }) {
  const { userId, favs, pending, toggle } = useFavorites();
  const { m } = useI18n();
  const pathname = usePathname();
  const size = compact ? "px-3 py-1.5 text-sm" : "w-full px-3 py-2 text-sm";

  if (!isSupabaseConfigured) return null;
  // 확인 중에는 자리만 잡아 둠 (버튼이 나타나며 화면이 밀리지 않게)
  if (userId === undefined) return <span aria-hidden className={`block ${compact ? "h-8 w-24" : "h-9"}`} />;

  if (userId === null) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className={`btn flex items-center justify-center gap-1.5 border border-lilac-300 font-semibold text-lilac-700 hover:bg-lilac-100 ${size}`}
      >
        <HeartIcon className="h-4 w-4" />
        {m.fav.pick}
      </Link>
    );
  }

  const on = favs.has(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      disabled={pending.has(slug)}
      aria-pressed={on}
      aria-label={fmt(on ? m.fav.removeAria : m.fav.pickAria, { name })}
      className={`flex items-center justify-center gap-1.5 border font-semibold ${size} ${
        on ? "border-lilac-500 bg-lilac-500 text-white hover:bg-lilac-700" : "border-lilac-300 text-lilac-700 hover:bg-lilac-100"
      }`}
    >
      <HeartIcon filled={on} className="h-4 w-4" />
      {on ? m.fav.mine : m.fav.pick}
    </button>
  );
}

/** 최애 페이지 위쪽: 지금 고른 최애 요약 / 로그인 안내 */
export function FavoriteSummary() {
  const { userId, favs, error } = useFavorites();
  const { m, locale } = useI18n();
  const pathname = usePathname();

  if (!isSupabaseConfigured || userId === undefined) return <div aria-hidden className="mb-5 h-12" />;

  const picked = members.filter((mem) => favs.has(mem.slug as MemberSlug));

  return (
    <div className="card mb-5 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm">
      {userId === null ? (
        <>
          <span>{m.fav.loginPrompt}</span>
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-lilac-700 underline">
            {m.auth.login}
          </Link>
        </>
      ) : picked.length === 0 ? (
        <span>{m.fav.none}</span>
      ) : (
        <>
          <span className="flex items-center gap-1 font-bold text-lilac-700">
            <HeartIcon filled className="h-4 w-4" />
            {m.fav.mine}
          </span>
          <ul className="flex flex-wrap gap-1.5">
            {picked.map((mem) => (
              <li key={mem.slug} className="px-2 py-0.5 font-semibold" style={{ backgroundColor: mem.color }}>
                {nameOf(mem, locale)}
              </li>
            ))}
          </ul>
          <span className="text-xs text-ink-soft">{m.fav.undoHint}</span>
        </>
      )}
      {error && <span className="w-full text-xs font-semibold text-blush-400">{m.fav.saveError}</span>}
    </div>
  );
}
