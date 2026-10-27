import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/server";

/**
 * 메일 속 링크(가입 인증·비밀번호 재설정)가 도착하는 곳.
 * - token_hash 방식: 다른 기기·브라우저에서 메일을 열어도 됨 (Supabase 메일 템플릿이 이 주소를 가리키게 설정)
 * - code 방식: Supabase 기본 메일 템플릿일 때. 요청한 같은 브라우저에서 열어야 함
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createClient();

  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("no token") };

  if (!error) return NextResponse.redirect(`${origin}${next}`);
  return NextResponse.redirect(`${origin}/login?error=${type === "recovery" || next === "/account/password" ? "reset" : "confirm"}`);
}
