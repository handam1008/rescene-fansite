import { NextResponse, type NextRequest } from "next/server";
import { isNaverConfigured, safeNext } from "@/lib/auth-providers";

/**
 * 네이버 로그인 시작: 네이버 로그인 화면으로 보냅니다.
 * state 는 다른 사이트가 로그인 결과를 끼워 넣지 못하게 하는 1회용 값이라 쿠키에 같이 저장해 두고, 돌아올 때 비교합니다.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  if (!isNaverConfigured()) return NextResponse.redirect(`${origin}/login?error=social`);

  const state = crypto.randomUUID();
  const authorize = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
  authorize.searchParams.set("redirect_uri", `${origin}/auth/naver/callback`);
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  const cookie = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/auth/naver", maxAge: 600 };
  response.cookies.set("naver_state", state, cookie);
  response.cookies.set("naver_next", safeNext(searchParams.get("next")), cookie);
  return response;
}
