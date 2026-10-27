/**
 * Supabase 연결 정보.
 * URL과 publishable 키는 브라우저에 그대로 전달되는 공개용 값이라 코드에 넣어도 안전합니다.
 * (데이터 보호는 supabase/migrations 의 RLS 보안 규칙이 담당)
 * Vercel 환경 변수를 넣으면 그 값이 우선합니다.
 * ⚠️ secret / service_role 키는 절대 여기에 넣지 마세요.
 */
const DEFAULT_URL = "https://srpmyhrbimcysypfkoeh.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_d2HwxiIZEV75ePyJZyb6Vw_S1xiCNjD";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_PUBLISHABLE_KEY;

/** 연결 정보가 없으면 회원·포카·게시판 기능 대신 "준비 중" 안내를 보여줍니다. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** 게시판 글 사진을 저장하는 Storage 버킷 이름 (supabase/migrations/0002 참고) */
export const POST_IMAGE_BUCKET = "post-images";

/** 포카 도감 카드 이미지 (공개, 관리자만 올림) · 회원 인증 사진 (비공개) — supabase/migrations/0003 참고 */
export const CATALOG_BUCKET = "pc-catalog";
export const PROOF_BUCKET = "pc-proofs";
