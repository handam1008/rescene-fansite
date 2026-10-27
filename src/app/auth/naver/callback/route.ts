import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { afterLoginPath, isNaverConfigured, safeNext } from "@/lib/auth-providers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * 네이버 로그인이 돌아오는 곳.
 * 1) state 확인 → 2) 코드를 네이버 토큰으로 교환 → 3) 네이버 고유 id 조회
 * 4) 그 id 로 회원을 찾거나 새로 만들고 → 5) 이 사이트 로그인 세션을 만들어 줍니다.
 *
 * 네이버가 주는 이메일은 사용자가 아무 주소나 적을 수 있는 "연락처 이메일"이라 믿지 않습니다.
 * 이메일로 기존 회원과 합치면 남의 계정에 들어갈 수 있어서, 네이버 고유 id 로만 회원을 찾습니다.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const fail = () => NextResponse.redirect(`${origin}/login?error=social`);

  const savedState = request.cookies.get("naver_state")?.value;
  const next = safeNext(request.cookies.get("naver_next")?.value);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!isNaverConfigured() || !code || !state || state !== savedState) return fail();

  const admin = createAdminClient();
  if (!admin) return fail();

  try {
    // 2) 코드 → 네이버 토큰
    const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.NAVER_CLIENT_SECRET!);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("state", state);
    const token = await (await fetch(tokenUrl, { method: "POST", cache: "no-store" })).json();
    if (!token.access_token) return fail();

    // 3) 네이버 고유 id (이 앱에서만 쓰이는 값)
    const me = await (
      await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${token.access_token}` },
        cache: "no-store",
      })
    ).json();
    const naverId: string | undefined = me?.response?.id;
    if (me?.resultcode !== "00" || !naverId) return fail();

    // 4) 회원 찾기 또는 만들기. 이메일은 받지 않으므로 로그인용 내부 주소를 만들어 씀 (메일은 보내지 않음)
    const email = `naver-${createHash("sha256").update(naverId).digest("hex").slice(0, 24)}@naver-login.invalid`;
    const { data: link } = await admin.from("naver_identities").select("user_id").eq("naver_id", naverId).maybeSingle();
    if (!link) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        app_metadata: { provider: "naver", providers: ["naver"] },
      });
      // 같은 사람이 동시에 두 번 눌러 이미 만들어진 경우가 아니면 실패
      if (!created.user && !error?.message.includes("already")) return fail();
    }

    // 5) 1회용 로그인 링크를 만들어 바로 사용 → 이 사이트 로그인 쿠키가 생김
    const { data: magic } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = magic.properties?.hashed_token;
    if (!tokenHash) return fail();
    const supabase = await createClient();
    const { data: session, error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
    if (error || !session.user) return fail();
    // 네이버 id ↔ 회원 연결 기록 (처음 로그인이 중간에 끊겼어도 여기서 채워짐)
    if (!link) await admin.from("naver_identities").upsert({ naver_id: naverId, user_id: session.user.id });

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    const response = NextResponse.redirect(`${origin}${afterLoginPath(next, profile?.nickname_set !== false)}`);
    response.cookies.delete({ name: "naver_state", path: "/auth/naver" });
    response.cookies.delete({ name: "naver_next", path: "/auth/naver" });
    return response;
  } catch {
    return fail();
  }
}
