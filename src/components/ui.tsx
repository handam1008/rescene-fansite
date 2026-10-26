import Link from "next/link";
import type { ReactNode } from "react";

/** 샘플 데이터에 붙는 "예시" 뱃지 */
export function SampleBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex shrink-0 items-center border border-dashed border-blush-400 bg-blush-100 px-2 py-0.5 text-[11px] font-semibold text-blush-400">
      예시
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-lilac-500 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-ink-soft">{description}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="card p-8 text-center text-sm text-ink-soft">{children}</div>;
}

/** 외부 링크 버튼. 새 탭으로 열립니다. */
export function ExternalButton({
  href,
  children,
  variant = "soft",
}: {
  href: string;
  children: ReactNode;
  variant?: "soft" | "solid";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold transition ${
        variant === "solid"
          ? "border border-lilac-300 bg-lilac-200 text-ink hover:bg-lilac-300"
          : "border border-lilac-200 bg-white text-ink hover:bg-lilac-100"
      }`}
    >
      {children}
      <span aria-hidden className="text-xs opacity-60">↗</span>
    </a>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-lilac-500 hover:text-lilac-700">
      {children} →
    </Link>
  );
}

/** 입력창 공통 스타일 */
export const inputClass =
  "w-full border border-lilac-200 bg-white px-3 py-2 text-sm outline-none focus:border-lilac-500";

export const buttonClass =
  "inline-flex items-center justify-center border border-lilac-300 bg-lilac-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-lilac-300 disabled:cursor-not-allowed disabled:opacity-50";

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return <p className="border border-blush-400 bg-blush-100 px-3 py-2 text-sm text-ink">{error}</p>;
  }
  if (message) {
    return <p className="border border-mint-dream-200 bg-mint-dream-100 px-3 py-2 text-sm text-ink">{message}</p>;
  }
  return null;
}

/** Supabase 환경 변수가 없을 때 회원·포카·게시판 자리에 보여주는 안내 */
export function SupabaseNotice() {
  return (
    <EmptyState>
      <p className="font-semibold text-ink">준비 중이에요</p>
      <p className="mt-1">회원 기능이 아직 연결되지 않았어요. 곧 열릴 예정이에요!</p>
    </EmptyState>
  );
}
