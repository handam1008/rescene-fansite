import type { NextConfig } from "next";

/** 모든 페이지에 붙는 보안 헤더 */
const securityHeaders = [
  // 다른 사이트가 이 사이트를 iframe에 넣어 클릭을 가로채는 공격(클릭재킹) 차단
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // 브라우저가 파일 형식을 멋대로 추측하지 않게
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 외부 링크로 나갈 때 전체 주소 대신 도메인만 전달
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 쓰지 않는 기기 권한은 꺼둠
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // 항상 HTTPS로만 접속 (Vercel 기본값과 같음)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
