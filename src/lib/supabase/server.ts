import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

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

/** 로그인한 사용자와 닉네임. 로그인하지 않았으면 null */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email, nickname: profile?.nickname ?? "리마인" };
}
