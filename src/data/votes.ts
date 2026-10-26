import type { Vote } from "@/types";

/**
 * 투표 목록.
 * ⚠️ 아래는 모두 "예시" 데이터입니다. 실제 정보로 바꾼 뒤 isSample을 false로 바꾸거나 지워주세요.
 * 순서는 상관없습니다. 진행 중 → 예정 → 종료 순으로 자동 정렬되고,
 * endDate가 지나면 자동으로 "종료" 표시가 붙습니다.
 */
export const votes: Vote[] = [
  {
    id: "sample-vote-1",
    isSample: true,
    awardName: "예시 시상식 A",
    category: "예시 부문",
    startDate: "2026-10-20T12:00:00+09:00",
    endDate: "2026-11-15T23:59:00+09:00",
    links: [{ label: "예시 투표 앱", url: "https://example.com" }],
    steps: [
      "예시) 투표 앱을 설치하고 로그인해요.",
      "예시) 상단 '투표' 탭에서 시상식을 선택해요.",
      "예시) 부문을 고르고 리센느에게 투표해요.",
      "예시) 매일 무료 투표권을 받아 다시 투표해요.",
    ],
    note: "예시) 하루 투표 가능 횟수가 정해져 있어요.",
  },
  {
    id: "sample-vote-2",
    isSample: true,
    awardName: "예시 시상식 B",
    category: "예시 부문",
    startDate: "2026-11-10T12:00:00+09:00",
    endDate: "2026-12-05T23:59:00+09:00",
    links: [
      { label: "예시 공식 사이트", url: "https://example.com" },
      { label: "예시 앱", url: "https://example.com" },
    ],
    steps: [
      "예시) 공식 사이트에 접속해 회원가입해요.",
      "예시) 투표 페이지에서 리센느를 선택해요.",
    ],
  },
  {
    id: "sample-vote-3",
    isSample: true,
    awardName: "예시 시상식 C",
    category: "예시 부문",
    startDate: "2026-09-01T12:00:00+09:00",
    endDate: "2026-09-30T23:59:00+09:00",
    links: [{ label: "예시 투표 앱", url: "https://example.com" }],
    steps: ["예시) 앱에서 투표해요."],
  },
];
