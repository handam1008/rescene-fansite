import { members, type MemberSlug } from "@/data/members";

/**
 * 나만의 리마인 카드 주소(쿼리) 읽기·만들기. 브라우저(카드 만들기 화면)와 서버가 같이 씀.
 * - u: 회원 id → 닉네임·칭호는 공개 프로필에서 읽음 (주소로 바꿔치기 못하게)
 * - s=1: 포카 수집·도감 개척 기록도 넣기 (u 가 있을 때만)
 * - name: 로그인 안 한 사람이 정한 이름 (닉네임 규칙과 같은 글자만)
 * - fav: 최애 멤버 (woni,liv…). 최애는 원래 본인만 보는 정보라, 본인이 고른 것만 주소에 담음
 */
export type CardParams = { u?: string; s?: boolean; name?: string; fav: MemberSlug[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUGS = members.map((m) => m.slug as string);

export function parseCardParams(get: (key: string) => string | null | undefined): CardParams {
  const u = get("u") ?? undefined;
  const fav = (get("fav") ?? "").split(",").filter((s): s is MemberSlug => SLUGS.includes(s));
  return {
    u: u && UUID.test(u) ? u : undefined,
    s: get("s") === "1",
    name: (get("name") ?? "").trim().slice(0, 20) || undefined,
    fav: members.map((m) => m.slug).filter((s) => fav.includes(s)),
  };
}

export function cardQuery(p: CardParams) {
  const q = new URLSearchParams();
  if (p.u) q.set("u", p.u);
  if (p.u && p.s) q.set("s", "1");
  if (!p.u && p.name) q.set("name", p.name);
  if (p.fav.length) q.set("fav", p.fav.join(","));
  return q.toString();
}

export const hasCard = (p: CardParams) => Boolean(p.u || p.name || p.fav.length);
