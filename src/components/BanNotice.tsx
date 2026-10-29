import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatFullDateTime } from "@/lib/format";

/** 이용 제한 중인 회원에게 보여주는 안내 (글·댓글·추천·신고·포카 인증이 막힘) */
export default async function BanNotice({ until, reason }: { until: string; reason?: string | null }) {
  const { m } = await getI18n();
  const forever = new Date(until).getFullYear() >= 2999;
  return (
    <p className="border border-blush-400 bg-blush-100 px-4 py-3 text-sm">
      {forever ? m.board.banForever : fmt(m.board.banUntil, { date: formatFullDateTime(until) })}
      {reason && <span className="mt-1 block text-xs text-ink-soft">{fmt(m.board.banReason, { r: reason })}</span>}
    </p>
  );
}
