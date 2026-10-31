import type { Locale } from "@/i18n/config";

/**
 * 컴백 응원 가이드(/guide)에 들어가는 정보.
 * 오늘 할 일·이번 주 일정·투표는 일정(schedule.ts)·투표(votes.ts)에서 자동으로 가져오고,
 * 여기에는 음악방송 요일표와 팬사인회·영상통화 응모처만 적습니다.
 */

type L10n = Record<Locale, string>;

/**
 * 음악방송 요일표. 방송사 사정(특집·결방·시간 변경)으로 자주 바뀌어서 "대략적인 시간"으로만 보여줌.
 * 리센느가 실제로 나오는 날은 schedule.ts 에 broadcast 일정으로 넣으면 "이번 주 리센느"에 뜸
 */
export const musicShows: { id: string; weekday: number; name: L10n; channel: string; time: L10n }[] = [
  {
    id: "show-champion",
    weekday: 3,
    name: { ko: "쇼챔피언", ja: "SHOW CHAMPION", en: "Show Champion" },
    channel: "MBC M · MBC every1",
    time: { ko: "오후 6시쯤", ja: "18時ごろ", en: "around 6 PM" },
  },
  {
    id: "m-countdown",
    weekday: 4,
    name: { ko: "엠카운트다운", ja: "M COUNTDOWN", en: "M Countdown" },
    channel: "Mnet",
    time: { ko: "오후 6시쯤", ja: "18時ごろ", en: "around 6 PM" },
  },
  {
    id: "music-bank",
    weekday: 5,
    name: { ko: "뮤직뱅크", ja: "ミュージックバンク", en: "Music Bank" },
    channel: "KBS2",
    time: { ko: "오후 5시쯤", ja: "17時ごろ", en: "around 5 PM" },
  },
  {
    id: "music-core",
    weekday: 6,
    name: { ko: "쇼! 음악중심", ja: "ショー！K-POPの中心", en: "Show! Music Core" },
    channel: "MBC",
    time: { ko: "오후 3시쯤", ja: "15時ごろ", en: "around 3 PM" },
  },
  {
    id: "inkigayo",
    weekday: 0,
    name: { ko: "인기가요", ja: "人気歌謡", en: "Inkigayo" },
    channel: "SBS",
    time: { ko: "오후 3시쯤", ja: "15時ごろ", en: "around 3 PM" },
  },
];

/**
 * 팬사인회·영상통화 응모처. 판매처 공지가 나오면 추가해 주세요 (응모 마감이 지나면 자동으로 숨겨짐).
 * kind: "offline" 대면 / "video" 영상통화
 */
export type FanEvent = {
  id: string;
  kind: "offline" | "video";
  shop: string;
  /** 응모 마감 (한국 시간) */
  applyEnd: string;
  /** 행사 날짜 (모르면 비움) */
  eventDate?: string;
  link: string;
};

export const fanEvents: FanEvent[] = [];
