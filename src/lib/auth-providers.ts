import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export type SocialProvider = "kakao" | "google";

/**
 * 지금 켜져 있는 소셜 로그인. Supabase 대시보드(Authentication → Providers)에서 켠 것만 버튼이 보입니다.
 * 설정 전에 버튼이 눌려 오류 나는 일이 없도록.
 */
export async function getEnabledProviders(): Promise<SocialProvider[]> {
  const enabled: SocialProvider[] = [];
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
      next: { revalidate: 300 },
    });
    const external = res.ok ? ((await res.json()).external as Record<string, boolean>) : {};
    if (external.kakao) enabled.push("kakao");
    if (external.google) enabled.push("google");
  } catch {
    // 확인하지 못하면 소셜 버튼 없이 이메일 로그인만
  }
  return enabled;
}

/** 로그인 직후 갈 곳: 닉네임을 아직 안 정했으면 내 정보 화면으로 */
export function afterLoginPath(next: string, nicknameSet: boolean) {
  return nicknameSet ? next : `/account?setup=1&next=${encodeURIComponent(next)}`;
}

/** 다른 사이트로 튕겨나가지 않도록 내부 경로만 허용 */
export function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
