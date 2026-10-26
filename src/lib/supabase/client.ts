import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
