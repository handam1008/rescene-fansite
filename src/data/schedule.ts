import type { MemberSlug } from "./members";

/**
 * 리센느 일정. 순서는 상관없고 날짜순으로 자동 정렬됩니다.
 * 멤버 생일은 src/data/members.ts 의 birthday로 자동 추가되니 여기 적지 않아도 돼요.
 *
 * members: 비워두면 "단체" 일정, ["woni"] 처럼 적으면 해당 멤버 개인 일정
 * date / endDate: 한국 시간(+09:00)으로. 하루 일정이면 endDate는 빼도 돼요.
 * allDay: 시간이 정해지지 않은 일정이면 true (날짜만 표시)
 *
 * 2026-10-27 기준 언론 보도로 채웠습니다. 음악방송·개인 스케줄은 공지가 나오면 추가해 주세요.
 */
export type ScheduleType = "release" | "broadcast" | "event" | "content" | "birthday" | "etc";

export type ScheduleEvent = {
  id: string;
  date: string;
  endDate?: string;
  allDay?: boolean;
  title: string;
  type: ScheduleType;
  members?: MemberSlug[];
  place?: string;
  link?: string;
};

export const schedule: ScheduleEvent[] = [
  {
    id: "2026-10-27-title-preview",
    date: "2026-10-27T00:00:00+09:00",
    allDay: true,
    title: "미니 4집 'PULSE' 타이틀 프리뷰 · 스페셜 콘텐츠",
    type: "content",
    link: "https://www.topstarnews.net/news/articleView.html?idxno=16245163",
  },
  {
    id: "2026-10-30-mv-teaser",
    date: "2026-10-30T00:00:00+09:00",
    allDay: true,
    title: "'With' 뮤직비디오 티저 공개",
    type: "content",
    link: "https://www.topstarnews.net/news/articleView.html?idxno=16245163",
  },
  {
    id: "2026-11-03-pulse",
    date: "2026-11-03T18:00:00+09:00",
    title: "미니 4집 'PULSE' 발매",
    type: "release",
    place: "각종 음원 사이트",
    link: "https://www.mediapen.com/news/view/1132218",
  },
  {
    id: "2026-11-20-mama",
    date: "2026-11-20T00:00:00+09:00",
    endDate: "2026-11-21T23:59:00+09:00",
    allDay: true,
    title: "2026 MAMA AWARDS 출연",
    type: "event",
    place: "일본 오사카 교세라 돔",
    link: "https://www.sportsseoul.com/news/read/1641156",
  },
];

export const scheduleTypeLabels: Record<ScheduleType, string> = {
  release: "발매",
  broadcast: "방송",
  event: "행사",
  content: "콘텐츠",
  birthday: "생일",
  etc: "기타",
};
