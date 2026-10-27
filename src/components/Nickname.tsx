import { contributorTitleFor, titleFor } from "@/data/titles";
import type { Author } from "@/types";

/** 닉네임 + 운영자 표시 + 도감 기여 칭호 + 포카 수집 칭호 */
export default function Nickname({ author, className = "" }: { author: Author; className?: string }) {
  if (!author) return <span className={className}>알 수 없음</span>;
  const title = titleFor(author.collected_count);
  const contributor = contributorTitleFor(author.contributor_rank, author.contributed_count);

  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      {author.is_admin && (
        <span className="shrink-0 bg-ink px-1 text-[10px] leading-4 font-bold text-white">운영자</span>
      )}
      {contributor && (
        <span className={`shrink-0 px-1 text-[10px] leading-4 font-bold ${contributor.className}`}>{contributor.name}</span>
      )}
      {title && (
        <span className={`shrink-0 px-1 text-[10px] leading-4 font-bold ${title.className}`}>{title.name}</span>
      )}
      <span className="truncate">{author.nickname}</span>
    </span>
  );
}
