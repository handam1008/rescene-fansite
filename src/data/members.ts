/**
 * 리센느 멤버 정보. 멤버 페이지·일정(생일)·멤버 게시판·포카 도감에 쓰입니다.
 * 2026-10-27 기준 공개 프로필(soridata, 나무위키)로 채웠습니다.
 *
 * slug: 주소에 쓰이는 영어 이름 (/members/woni). 바꾸면 DB(게시판·도감)와 안 맞으니 바꾸지 마세요.
 * image: 프로필 사진을 public/images/members/ 에 넣고 "/images/members/woni.jpg" 처럼 적으면 표시됩니다.
 * color: 사이트에서 멤버를 구분하는 색 (공식 멤버 컬러 아님)
 */
export const members = [
  {
    slug: "woni",
    name: "원이",
    english: "Woni",
    birthday: "2004-05-25",
    nationality: "대한민국",
    note: "리더",
    color: "#c9b6f7",
    image: "",
  },
  {
    slug: "liv",
    name: "리브",
    english: "Liv",
    birthday: "2006-10-11",
    nationality: "대한민국",
    note: "",
    color: "#f5a3c4",
    image: "",
  },
  {
    slug: "minami",
    name: "미나미",
    english: "Minami",
    birthday: "2006-11-29",
    nationality: "일본",
    note: "",
    color: "#9fd3f5",
    image: "",
  },
  {
    slug: "may",
    name: "메이",
    english: "May",
    birthday: "2008-08-19",
    nationality: "대한민국",
    note: "",
    color: "#a8e6cf",
    image: "",
  },
  {
    slug: "zena",
    name: "제나",
    english: "Zena",
    birthday: "2008-11-27",
    nationality: "대한민국",
    note: "막내",
    color: "#ffd59e",
    image: "",
  },
] as const;

export type Member = (typeof members)[number];
export type MemberSlug = Member["slug"];

export function getMember(slug: string | null | undefined): Member | undefined {
  return members.find((m) => m.slug === slug);
}

/** "woni" → "원이". 없으면 빈 문자열 */
export function memberName(slug: string | null | undefined) {
  return getMember(slug)?.name ?? "";
}

/** 포카 도감 멤버 구분: 멤버 5명 + 단체 */
export const pokedexMembers = [
  ...members.map((m) => ({ slug: m.slug as string, name: m.name as string })),
  { slug: "group", name: "단체" },
];

export function pokedexMemberName(slug: string) {
  return pokedexMembers.find((m) => m.slug === slug)?.name ?? slug;
}
