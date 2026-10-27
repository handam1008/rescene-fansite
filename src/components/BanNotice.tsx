import { formatFullDateTime } from "@/lib/format";

/** 이용 제한 중인 회원에게 보여주는 안내 (글·댓글·추천·신고·포카 인증이 막힘) */
export default function BanNotice({ until, reason }: { until: string; reason?: string | null }) {
  const forever = new Date(until).getFullYear() >= 2999;
  return (
    <p className="border border-blush-400 bg-blush-100 px-4 py-3 text-sm">
      🚫 게시판 규칙 위반으로 {forever ? "이용이 제한됐어요" : `${formatFullDateTime(until)}까지 이용이 제한됐어요`}. 글·댓글·추천·신고·포카
      인증을 할 수 없어요.
      {reason && <span className="mt-1 block text-xs text-ink-soft">사유: {reason}</span>}
    </p>
  );
}
