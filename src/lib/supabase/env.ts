export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 환경 변수가 없으면 회원·포카·게시판 기능 대신 "연결 전" 안내를 보여줍니다. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** 포카 이미지를 저장하는 Storage 버킷 이름 (supabase/migrations 참고) */
export const PHOTOCARD_BUCKET = "photocards";
