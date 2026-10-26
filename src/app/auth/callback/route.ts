import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 가입 인증 메일의 링크가 도착하는 곳. 인증 코드를 로그인 세션으로 바꿉니다. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/?welcome=1`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
