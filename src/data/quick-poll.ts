import type { Locale } from "@/i18n/config";

/**
 * 홈 화면 원클릭 투표 (0017 SQL). 질문을 바꾸려면 id 를 새로 정하고 질문·보기를 고치면 됨
 * (id 가 바뀌면 표가 0부터 다시 시작). 보기 key 는 30자 이하 영문.
 */
export type QuickPoll = {
  id: string;
  question: Record<Locale, string>;
  options: { key: string; emoji: string; label: Record<Locale, string> }[];
};

export const quickPoll: QuickPoll = {
  id: "pulse-expect",
  question: {
    ko: "PULSE 컴백, 제일 기대되는 건?",
    ja: "PULSEカムバック、いちばん楽しみなのは？",
    en: "What are you most excited for in the PULSE comeback?",
  },
  options: [
    { key: "title", emoji: "🎵", label: { ko: "타이틀곡", ja: "タイトル曲", en: "Title track" } },
    { key: "mv", emoji: "🎬", label: { ko: "뮤직비디오", ja: "MV", en: "Music video" } },
    { key: "stage", emoji: "💃", label: { ko: "무대·안무", ja: "ステージ・ダンス", en: "Stages & choreo" } },
    { key: "visual", emoji: "📸", label: { ko: "콘셉트·비주얼", ja: "コンセプト・ビジュアル", en: "Concept & visuals" } },
    { key: "bsides", emoji: "💿", label: { ko: "수록곡", ja: "収録曲", en: "B-sides" } },
  ],
};
