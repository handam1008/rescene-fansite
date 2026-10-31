import { getI18n } from "@/i18n/server";
import type { Author } from "@/types";
import TitleBadges from "./TitleBadges";

/** 닉네임 + 운영자 표시 + 칭호(퀴즈·도감 기여·포카 수집) */
export default async function Nickname({ author, className = "" }: { author: Author; className?: string }) {
  const { m, locale } = await getI18n();
  if (!author) return <span className={className}>{m.home.unknownUser}</span>;

  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      {author.is_admin && (
        <span className="shrink-0 bg-ink px-1 text-[10px] leading-4 font-bold text-white">{m.auth.admin}</span>
      )}
      <TitleBadges author={author} locale={locale} />
      <span className="truncate">{author.nickname}</span>
    </span>
  );
}
