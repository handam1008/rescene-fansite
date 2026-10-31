import type { MemberSlug } from "./members";

/**
 * 멤버 페이지의 "추천 팬튜브". 채널 주인에게 허락받은 채널만 넣어요.
 * member: 주로 다루는 멤버 (그 멤버 페이지에 표시)
 */
export const fanChannels: { member: MemberSlug; name: string; handle: string; url: string }[] = [
  // 2026-10-31 채널 주인 허락 (메일)
  { member: "zena", name: "까엉이", handle: "@신라까엉이", url: "https://www.youtube.com/@신라까엉이" },
];
