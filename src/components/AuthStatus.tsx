"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * 헤더 오른쪽의 로그인 상태.
 * 브라우저에서 확인하기 때문에 홈·컴백 같은 페이지는 정적으로 빠르게 유지됩니다.
 */
export default function AuthStatus() {
  const router = useRouter();
  // 서버에서 로그인한 뒤 페이지가 바뀌면 다시 확인
  const pathname = usePathname();
  const [nickname, setNickname] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    async function load(userId: string | undefined) {
      if (!userId) {
        setIsAdmin(false);
        setUnread(0);
        return setNickname(null);
      }
      // "*" : 관리자 컬럼(0003 SQL)이 없어도 동작하도록
      const [{ data }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        // 안 읽은 댓글 알림 수 (0010 SQL 전이면 0)
        supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
      ]);
      setNickname(data?.nickname ?? "리마인");
      setIsAdmin(data?.is_admin === true);
      setUnread(count ?? 0);
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  // 연결 전이거나 아직 확인 중이면 자리만 차지하지 않게 숨김
  if (!isSupabaseConfigured || nickname === undefined) return null;

  if (nickname === null) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap sm:text-sm">
        <Link href="/login" className="btn border border-lilac-300 px-2.5 py-1 text-lilac-700 hover:bg-lilac-100">
          로그인
        </Link>
        <Link href="/signup" className="btn border border-lilac-300 bg-lilac-200 px-2.5 py-1 text-ink hover:bg-lilac-300">
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isAdmin && (
        <Link href="/admin" className="btn bg-ink px-2 py-0.5 text-xs font-bold text-white hover:bg-lilac-700">
          🛠 운영자
        </Link>
      )}
      <Link href="/notifications" className="btn relative px-1 text-base" aria-label={`알림${unread ? ` ${unread}개` : ""}`}>
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-4 bg-blush-400 px-1 text-center text-[10px] leading-4 font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
      <Link href="/account" className="font-semibold hover:underline" title="내 정보">
        {nickname}
      </Link>
      <button
        type="button"
        onClick={async () => {
          await createClient().auth.signOut();
          router.refresh();
        }}
        className="text-ink-soft underline hover:text-ink"
      >
        로그아웃
      </button>
    </div>
  );
}
