import type { HiddenReason, ReportReason } from "@/types";

/** 신고 사유 (DB 의 post_reports.reason 값과 같아야 함) */
export const reportReasons: Record<ReportReason, string> = {
  spam: "도배·광고",
  abuse: "욕설·비방",
  adult: "음란·선정적",
  privacy: "개인정보 노출",
  copyright: "저작권 침해",
  other: "기타",
};

export const hiddenReasons: Record<HiddenReason, string> = {
  reports: "신고가 많이 들어와",
  dislikes: "비추천이 많아",
  admin: "운영자가",
};

/** 자동 숨김 기준 (supabase/migrations/0007 의 auto_hide_post 와 맞춰서 안내용으로만 씀) */
export const AUTO_HIDE_REPORTS = 5;
export const AUTO_HIDE_DISLIKES = 10;
