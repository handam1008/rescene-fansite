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

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    async function load(userId: string | undefined) {
      if (!userId) return setNickname(null);
      const { data } = await supabase.from("profiles").select("nickname").eq("id", userId).maybeSingle();
      setNickname(data?.nickname ?? "리마인");
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
      <Link href="/login" className="border border-lilac-300 px-3 py-1 text-sm font-semibold text-lilac-700 hover:bg-lilac-100">
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold">{nickname}</span>
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
