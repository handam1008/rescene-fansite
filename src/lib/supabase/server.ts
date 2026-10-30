import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";

/** 서버 컴포넌트·서버 액션·라우트 핸들러용 Supabase 클라이언트. 요청마다 새로 만들어야 합니다. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다. 세션 갱신은 middleware가 맡습니다.
        }
      },
    },
  });
}

/** 로그인한 사용자와 닉네임·관리자 여부·수집 개수. 로그인하지 않았으면 null */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 이용 제한 기간·사유는 공개 칸이 아니라서 본인용 함수로 따로 읽음 (0018)
  const [{ data: profile }, { data: bans }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle(),
    supabase.rpc("my_ban"),
  ]);
  const ban = (Array.isArray(bans) ? bans[0] : null) as { banned_until: string | null; ban_reason: string | null } | null;

  return {
    id: user.id,
    email: user.email,
    nickname: (profile?.nickname as string | undefined) ?? "리마인",
    isAdmin: profile?.is_admin === true,
    collectedCount: (profile?.collected_count as number | undefined) ?? 0,
    contributedCount: (profile?.contributed_count as number | undefined) ?? 0,
    contributorRank: (profile?.contributor_rank as number | null | undefined) ?? null,
    // 이용 제한 중이면 끝나는 때와 이유 (0010)
    bannedUntil:
      ban?.banned_until && new Date(ban.banned_until) > new Date() ? ban.banned_until : null,
    banReason: ban?.ban_reason ?? null,
  };
}
