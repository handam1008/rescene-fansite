import type { Comeback } from "@/types";

/**
 * 컴백 정보.
 * ⚠️ 아래는 모두 "예시" 데이터입니다. 실제 정보로 바꾼 뒤 isSample을 false로 바꾸거나 지워주세요.
 * 배열의 첫 번째 항목이 메인·컴백 페이지에 표시됩니다.
 */
export const comebacks: Comeback[] = [
  {
    id: "sample-comeback-1",
    isSample: true,
    albumTitle: "예시 앨범명",
    albumType: "예시 미니앨범",
    titleTrack: "예시 타이틀곡",
    releaseDate: "2026-12-01T18:00:00+09:00",
    description: "여기에 컴백 소개 문구를 적어주세요. (예시)",
    teasers: [
      { date: "2026-11-17T00:00:00+09:00", title: "트랙리스트 공개 (예시)" },
      { date: "2026-11-20T00:00:00+09:00", title: "콘셉트 포토 1 (예시)" },
      { date: "2026-11-23T00:00:00+09:00", title: "콘셉트 포토 2 (예시)" },
      { date: "2026-11-26T00:00:00+09:00", title: "하이라이트 메들리 (예시)" },
      { date: "2026-11-29T00:00:00+09:00", title: "MV 티저 (예시)" },
    ],
  },
];
