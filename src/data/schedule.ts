import type { MemberSlug } from "./members";

/**
 * 리센느 일정. 순서는 상관없고 날짜순으로 자동 정렬됩니다.
 * 멤버 생일은 src/data/members.ts 의 birthday로 자동 추가되니 여기 적지 않아도 돼요.
 *
 * members: 비워두면 "단체" 일정, ["woni"] 처럼 적으면 해당 멤버 개인 일정
 * date / endDate: 한국 시간(+09:00)으로. 하루 일정이면 endDate는 빼도 돼요.
 * allDay: 시간이 정해지지 않은 일정이면 true (날짜만 표시)
 * important: 컴백처럼 중요한 일정이면 true (달력·목록에 ★). 곡 발매일은 자동으로 ★
 * tentative: 공식 확정이 아닌 예상 일정이면 true (점선·"미확정" 표시)
 * live: 실시간으로 볼 수 있는 주소(유튜브 라이브 등). 적으면 그 시간(date ~ endDate, 없으면 2시간) 동안
 *       사이트 위쪽에 빨간 LIVE 줄이 뜸. 갑자기 하는 라이브는 /admin "라이브" 탭에서 넣는 게 편해요.
 *
 * 2026-10-27 기준. 공식 SNS·유튜브 업로드 기록과 출연 확정 보도로 확인한 일정만 넣었습니다(link 가 출처).
 * 음악방송·쇼케이스·팬사인회·연말 가요제는 공식 발표가 나오면 추가해 주세요.
 * 곡 발매일은 src/data/songs.ts 에서 자동으로 달력에 들어갑니다.
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
  important?: boolean;
  tentative?: boolean;
  live?: string;
};

export const schedule: ScheduleEvent[] = [
  // ── 미니 4집 'PULSE' 프로모션 (10월 12일 공식 SNS 스케줄러, MK스포츠·톱스타뉴스 보도) ──
  {
    id: "2026-10-13-preorder",
    date: "2026-10-13T00:00:00+09:00",
    allDay: true,
    title: "미니 4집 'PULSE' 예약 판매 시작",
    type: "release",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-19-concept-a",
    date: "2026-10-19T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 포토 A 공개",
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-20-concept-b",
    date: "2026-10-20T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 포토 B 공개",
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-22-trailer",
    date: "2026-10-22T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 트레일러 공개",
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-23-tracklist",
    date: "2026-10-23T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 앨범 디테일 · 트랙리스트 공개",
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-26-highlight",
    date: "2026-10-26T18:00:00+09:00",
    title: "'PULSE' 하이라이트 메들리 공개",
    type: "content",
    link: "https://www.youtube.com/watch?v=kmDGZd1mv7I",
  },
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
    important: true,
    place: "각종 음원 사이트",
    link: "https://www.mediapen.com/news/view/1132218",
  },

  // ── 시상식 · 행사 (출연 확정 보도 기준) ──
  {
    id: "2026-11-07-kgma",
    date: "2026-11-07T00:00:00+09:00",
    allDay: true,
    title: "2026 KGMA 아티스트 데이 출연 · 원이 MC",
    type: "event",
    place: "서울 고척스카이돔",
    link: "https://isplus.com/article/view/isp202609090130",
  },
  {
    id: "2026-11-14-mma",
    date: "2026-11-14T00:00:00+09:00",
    endDate: "2026-11-15T23:59:00+09:00",
    allDay: true,
    title: "멜론뮤직어워드 MMA 2026 출연 (출연일 미정)",
    type: "event",
    place: "서울 고척스카이돔",
    link: "https://www.dailian.co.kr/news/view/1698649",
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
  {
    id: "2026-12-05-aaa",
    date: "2026-12-05T00:00:00+09:00",
    endDate: "2026-12-06T23:59:00+09:00",
    allDay: true,
    title: "AAA 2026 출연 (양일)",
    type: "event",
    place: "대만 가오슝 내셔널 스타디움",
    link: "https://www.koreadaily.com/article/20260914152857308",
  },
  {
    id: "2027-01-15-dawards",
    date: "2027-01-15T00:00:00+09:00",
    endDate: "2027-01-16T23:59:00+09:00",
    allDay: true,
    title: "D AWARDS 2027 출연",
    type: "event",
    place: "프랑스 파리 라데팡스 아레나",
    link: "https://www.koreadaily.com/article/20261012172027290",
  },

  // ── 안원잘부 (원이 유튜브 '안녕하세요원이입니다잘부탁드립니다') 시즌2 업로드. 시각은 유튜브 공식 업로드 기록 ──
  {
    id: "2026-08-07-anwonjalbu",
    date: "2026-08-07T00:00:00+09:00",
    allDay: true,
    title: "[안원잘부] 시즌2 첫 공개",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://m.news.nate.com/view/20260807n26483",
  },
  {
    id: "2026-08-21-anwonjalbu",
    date: "2026-08-21T19:00:00+09:00",
    title: "[안원잘부] 고윤정을 좋아하세요?",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=6y_g78FQ3io",
  },
  {
    id: "2026-08-28-anwonjalbu",
    date: "2026-08-28T19:00:00+09:00",
    title: "[안원잘부] 원이 근황",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=EsKmhBMmqIM",
  },
  {
    id: "2026-09-04-anwonjalbu",
    date: "2026-09-04T19:00:00+09:00",
    title: "[안원잘부] 지금 기분이 어때요?",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=WQIerKK8zUQ",
  },
  {
    id: "2026-09-08-anwonjalbu",
    date: "2026-09-08T17:00:00+09:00",
    title: "[안원잘부] 두 번째 급습",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=xCvbDeMKm3E",
  },
  {
    id: "2026-09-11-anwonjalbu",
    date: "2026-09-11T19:00:00+09:00",
    title: "[안원잘부] 살과의 전쟁: 20kg의 진실",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=GJuMbGXXedY",
  },
  {
    id: "2026-09-15-anwonjalbu",
    date: "2026-09-15T18:00:00+09:00",
    title: "[안원잘부] 스팸 원이 에디션(?)",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=mFM2hP5LEhM",
  },
  {
    id: "2026-09-18-anwonjalbu",
    date: "2026-09-18T19:00:00+09:00",
    title: "[안원잘부] [추석 특집] 제나의 트로트 메들리",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=JYUilbw34Z0",
  },
  {
    id: "2026-10-01-anwonjalbu",
    date: "2026-10-01T17:00:00+09:00",
    title: "[안원잘부] 치명적인 실수",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=zxNoW_LtVLE",
  },
  {
    id: "2026-10-04-anwonjalbu",
    date: "2026-10-04T19:00:00+09:00",
    title: "[안원잘부] 오사카에서 생긴 일",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=8tmaJYDMp5w",
  },
  {
    id: "2026-10-09-anwonjalbu",
    date: "2026-10-09T11:00:00+09:00",
    title: "[안원잘부] 명장면 이모티콘2 출시",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=DKDmFgXzxs8",
  },
  {
    id: "2026-10-12-anwonjalbu",
    date: "2026-10-12T19:30:00+09:00",
    title: "[안원잘부] ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=8e0FfuwOI9M",
  },
  {
    id: "2026-10-17-anwonjalbu",
    date: "2026-10-17T17:00:00+09:00",
    title: "[안원잘부] 언니 나 빼고 촬영 갔어?",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=3Vb2TGjxDes",
  },
  {
    id: "2026-10-25-anwonjalbu",
    date: "2026-10-25T19:00:00+09:00",
    title: "[안원잘부] 4인조 걸그룹 리센느",
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=1kHqK1oqHzc",
  },
];

/**
 * 안원잘부 예상 업로드: 솔파스튜디오 공지(2026-10 초) "연말까지 매주 금요일을 목표로 하되, 상황에 따라 주기와 요일이 바뀔 수 있음".
 * 이 기간의 금요일마다 "미확정" 일정으로 달력에 자동 표시됩니다(lib/schedule.ts).
 * 지난 날짜와, 그 주에 실제 업로드([안원잘부] 일정)가 이미 적혀 있는 주는 자동으로 빠집니다.
 */
export const anwonjalbuPlan = {
  from: "2026-10-30",
  until: "2026-12-31",
  link: "https://www.youtube.com/post/UgkxYZhaOWAFY3P8Zb6YbEYPXX7_lEb6kR61",
};

export const scheduleTypeLabels: Record<ScheduleType, string> = {
  release: "발매",
  broadcast: "방송",
  event: "행사",
  content: "콘텐츠",
  birthday: "생일",
  etc: "기타",
};
