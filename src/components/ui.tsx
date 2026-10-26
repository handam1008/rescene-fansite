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
