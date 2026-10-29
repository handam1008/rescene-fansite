"use client";

import { useI18n } from "@/i18n/client";

/** 샘플 데이터에 붙는 "예시" 뱃지 */
export function SampleBadge({ show }: { show?: boolean }) {
  const { m } = useI18n();
  if (!show) return null;
  return (
    <span className="inline-flex shrink-0 items-center border border-dashed border-blush-400 bg-blush-100 px-2 py-0.5 text-[11px] font-semibold text-blush-400">
      {m.common.sample}
    </span>
  );
}

/** Supabase 환경 변수가 없을 때 회원·포카·게시판 자리에 보여주는 안내 */
export function SupabaseNotice() {
  const { m } = useI18n();
  return (
    <div className="card p-8 text-center text-sm text-ink-soft">
      <p className="font-semibold text-ink">{m.common.preparing}</p>
      <p className="mt-1">{m.common.notConnected}</p>
    </div>
  );
}
