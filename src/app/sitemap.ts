import type { MetadataRoute } from "next";
import { members } from "@/data/members";
import { SITE_URL } from "@/lib/site-url";

/**
 * 구글·네이버에 알려주는 페이지 목록 (/sitemap.xml).
 * 검색 등록할 때 이 주소를 제출하면 됩니다. 로그인·운영자 화면처럼 검색에 나올 필요 없는 곳은 뺌.
 */
type Page = { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number };

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Page[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/schedule", changeFrequency: "daily", priority: 0.9 },
    { path: "/comeback", changeFrequency: "weekly", priority: 0.9 },
    { path: "/votes", changeFrequency: "daily", priority: 0.8 },
    { path: "/live", changeFrequency: "daily", priority: 0.7 },
    { path: "/videos", changeFrequency: "hourly", priority: 0.8 },
    { path: "/news", changeFrequency: "hourly", priority: 0.7 },
    { path: "/songs", changeFrequency: "weekly", priority: 0.7 },
    { path: "/members", changeFrequency: "monthly", priority: 0.7 },
    { path: "/photocards", changeFrequency: "daily", priority: 0.7 },
    { path: "/board", changeFrequency: "daily", priority: 0.6 },
    ...members.map((m): Page => ({ path: `/members/${m.slug}`, changeFrequency: "weekly", priority: 0.6 })),
    { path: "/privacy", changeFrequency: "yearly", priority: 0.1 },
  ];

  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, changeFrequency: p.changeFrequency, priority: p.priority }));
}
