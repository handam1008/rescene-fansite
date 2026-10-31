import { contributorTitleFor, quizFameTitle, quizWeekTitleFor, titleFor, titleName } from "@/data/titles";
import type { Locale } from "@/i18n/config";
import type { Author } from "@/types";

/**
 * 닉네임 옆 칭호들: 퀴즈(명예의 전당·이번 주 순위) → 도감 기여 → 포카 수집 순.
 * 훅이 없어서 서버(Nickname)·클라이언트(퀴즈 랭킹) 어디서나 씀
 */
export default function TitleBadges({ author, locale }: { author: NonNullable<Author>; locale: Locale }) {
  const list = [
    author.quiz_fame ? quizFameTitle : undefined,
    quizWeekTitleFor(author.quiz_rank, author.quiz_rank_week),
    contributorTitleFor(author.contributor_rank, author.contributed_count),
    titleFor(author.collected_count),
  ].filter((t) => t !== undefined);
  return (
    <>
      {list.map((t) => (
        <span key={t.name} className={`shrink-0 px-1 text-[10px] leading-4 font-bold ${t.className}`}>
          {titleName(t, locale)}
        </span>
      ))}
    </>
  );
}
