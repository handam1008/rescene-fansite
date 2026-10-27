import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 로그인 상태가 필요한 페이지에서만 실행 (정적 파일·이미지 제외)
  matcher: [
    "/login",
    "/signup",
    "/auth/:path*",
    "/photocards/:path*",
    "/board/:path*",
    "/members/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/notifications",
    "/forgot-password",
  ],
};
