import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * 로그인 정보 없이 공개 데이터만 읽는 클라이언트.
 * 쿠키를 쓰지 않아서 홈처럼 미리 만들어두는(정적) 페이지에서도 쓸 수 있습니다.
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
