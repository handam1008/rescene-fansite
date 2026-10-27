import { titleFor } from "@/data/titles";
import type { Author } from "@/types";

/** 닉네임 + 운영자 표시 + 포카 도감 칭호 */
export default function Nickname({ author, className = "" }: { author: Author; className?: string }) {
  if (!author) return <span className={className}>알 수 없음</span>;
  const title = titleFor(author.collected_count);

  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      {author.is_admin && (
        <span className="shrink-0 bg-ink px-1 text-[10px] leading-4 font-bold text-white">운영자</span>
      )}
      {title && (
        <span className={`shrink-0 px-1 text-[10px] leading-4 font-bold ${title.className}`}>{title.name}</span>
      )}
      <span className="truncate">{author.nickname}</span>
    </span>
  );
}
