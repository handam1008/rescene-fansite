import type { Comeback } from "@/types";

/**
 * 컴백 정보. 배열의 첫 번째 항목이 메인·컴백 페이지에 표시됩니다.
 * 2026-10-26 기준 언론 보도(소속사 더뮤즈엔터테인먼트 발표)로 채웠습니다.
 * 티저 공개 시각은 발표되지 않아 날짜만 맞춰뒀습니다(00:00 기준).
 */
export const comebacks: Comeback[] = [
  {
    id: "2026-11-pulse",
    albumTitle: "PULSE",
    albumType: "미니 4집",
    titleTrack: "With",
    releaseDate: "2026-11-03T18:00:00+09:00",
    description:
      "'심장 박동'을 뜻하는 PULSE. 미니 3집 'lip bomb' 이후 약 1년 만의 실물 앨범이에요.",
    tracklist: ["With (타이틀)", "Finest Thing", "백화요란 (Inside Out)", "MEME", "Dragon"],
    sourceUrl: "https://www.mediapen.com/news/view/1132218",
    teasers: [
      { date: "2026-10-13T00:00:00+09:00", title: "프리 오더 시작" },
      { date: "2026-10-19T00:00:00+09:00", title: "콘셉트 포토 A" },
      { date: "2026-10-20T00:00:00+09:00", title: "콘셉트 포토 B" },
      { date: "2026-10-22T00:00:00+09:00", title: "콘셉트 트레일러" },
      { date: "2026-10-23T00:00:00+09:00", title: "앨범 디테일 · 트랙리스트" },
      { date: "2026-10-26T00:00:00+09:00", title: "하이라이트 메들리" },
      { date: "2026-10-27T00:00:00+09:00", title: "타이틀 프리뷰 · 스페셜 콘텐츠" },
      { date: "2026-10-30T00:00:00+09:00", title: "'With' 뮤직비디오 티저" },
    ],
  },
];
