import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** 검색 로봇 안내 (/robots.txt): 개인 화면·글쓰기 화면은 수집하지 말고, 사이트맵은 여기 있다고 알려줌 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/notifications", "/auth/", "/board/new", "/board/*/edit"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
