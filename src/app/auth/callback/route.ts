import { NextResponse, type NextRequest } from "next/server";
import { afterLoginPath, safeNext } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/server";

/**
 * 가입 인증 메일의 링크와 구글·카카오 로그인이 돌아오는 곳. 인증 코드를 로그인 세션으로 바꿉니다.
 * 소셜 로그인으로 처음 들어온 회원은 닉네임을 정하는 화면으로 보냅니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      const target = next ? safeNext(next) : "/?welcome=1";
      return NextResponse.redirect(`${origin}${afterLoginPath(target, profile?.nickname_set !== false)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${searchParams.get("error") ? "social" : "confirm"}`);
}
