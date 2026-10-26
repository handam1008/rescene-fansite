import type { Vote } from "@/types";

/**
 * 투표 목록. 순서는 상관없습니다. 진행 중 → 예정 → 종료 순으로 자동 정렬되고,
 * endDate가 지나면 자동으로 "종료" 표시가 붙습니다.
 * 2026-10-26 기준 리센느 공식 X·MAMA 공식 X·언론 보도로 채웠습니다.
 */
export const votes: Vote[] = [
  {
    id: "mma2026-top10",
    awardName: "MMA 2026 (멜론뮤직어워드)",
    category: "TOP10",
    startDate: "2026-10-15T00:00:00+09:00",
    endDate: "2026-10-29T23:59:00+09:00",
    links: [{ label: "멜론", url: "https://www.melon.com/" }],
    steps: [
      "멜론 앱을 설치하고 로그인해요. (본인인증 완료 계정만 투표 가능)",
      "하단 또는 상단의 MMA 탭으로 들어가요.",
      "'TOP10 투표하기'를 눌러요.",
      "RESCENE(리센느)를 선택해 투표해요.",
    ],
    note: "1인 1계정. TOP10은 음원 60% + 심사 20% + 투표 20%로 결정돼요.",
  },
  {
    id: "mma2026-category",
    awardName: "MMA 2026 (멜론뮤직어워드)",
    category: "부문별 투표",
    startDate: "2026-10-30T00:00:00+09:00",
    endDate: "2026-11-13T23:59:00+09:00",
    links: [{ label: "멜론", url: "https://www.melon.com/" }],
    steps: [
      "멜론 앱 → MMA 탭으로 들어가요.",
      "부문별 투표에서 리센느가 후보로 오른 부문을 골라요.",
      "RESCENE(리센느)를 선택해 투표해요.",
    ],
    note: "보도 기준 일정이에요. 리센느가 오른 부문은 투표가 열리면 멜론 공지로 확인해 주세요.",
  },
  {
    id: "mama2026-fans-choice-2",
    awardName: "2026 MAMA AWARDS",
    category: "FANS' CHOICE 여자 부문 2차",
    startDate: "2026-10-28T18:00:00+09:00",
    endDate: "2026-11-08T23:59:00+09:00",
    links: [
      { label: "Mnet Plus", url: "https://www.mnetplus.world/" },
      { label: "X 해시태그 투표", url: "https://x.com/" },
    ],
    steps: [
      "Mnet Plus 앱을 설치하고 로그인해요.",
      "2026 MAMA AWARDS → FANS' CHOICE → 여자 부문으로 들어가요.",
      "RESCENE(리센느)에 투표해요.",
      "X에서 #2026MAMAVOTE 와 #RESCENE 해시태그를 모두 넣어 글을 올리면 추가 투표가 돼요. (공개 계정당 하루 1회)",
    ],
    note: "Mnet Plus 90% + X 10% 합산. 리센느의 2차 진출 여부는 1차 결과 발표 후 Mnet Plus에서 확인해 주세요.",
  },
  {
    id: "mama2026-fans-choice-1",
    awardName: "2026 MAMA AWARDS",
    category: "FANS' CHOICE 여자 부문 1차",
    startDate: "2026-10-12T19:00:00+09:00",
    endDate: "2026-10-22T23:59:00+09:00",
    links: [{ label: "Mnet Plus", url: "https://www.mnetplus.world/" }],
    steps: [
      "Mnet Plus 앱 → 2026 MAMA AWARDS FANS' CHOICE 1차 투표로 들어가요.",
      "팬스 초이스 여자 → RESCENE(리센느)에 투표해요.",
    ],
  },
];
