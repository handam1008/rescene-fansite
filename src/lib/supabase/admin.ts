import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * 서버 전용 관리자 클라이언트 (보안 규칙을 건너뜀). 네이버 로그인에서 회원을 만들고 로그인시킬 때만 씁니다.
 * 키는 Vercel 환경 변수 SUPABASE_SECRET_KEY 에만 두고, 코드나 NEXT_PUBLIC_ 변수에 절대 넣지 마세요.
 * (NEXT_PUBLIC_ 이 아닌 환경 변수는 브라우저로 전달되지 않습니다)
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
