import Link from "next/link";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatBoardDate } from "@/lib/format";
import type { PostSummary } from "@/types";
import { MoreLink } from "./ui";

/**
 * 인기글: 최근 일주일 조회수 순위.
 * compact: 넓은 PC 화면 왼쪽 사이드바용 (제목 한 줄 + 정보 한 줄)
 */
export default async function PopularPosts({ posts, compact = false }: { posts: PostSummary[]; compact?: boolean }) {
  const { m } = await getI18n();
  return (
    <section className={`card ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold whitespace-nowrap">{m.home.popular}</h2>
        <MoreLink href="/board?tab=best">{m.home.more}</MoreLink>
      </div>

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          {m.home.noPostsBefore}
          <Link href="/board" className="font-semibold text-lilac-700 underline">
            {m.home.noPostsLink}
          </Link>
          {m.home.noPostsAfter}
        </p>
      ) : (
        <ol className="mt-3 divide-y divide-lilac-100">
          {posts.map((post, i) => {
            const comments = post.comments[0]?.count ?? 0;
            return (
              <li key={post.id}>
                <Link
                  href={`/board/${post.id}`}
                  className={`flex gap-3 hover:bg-lilac-50 ${compact ? "items-start gap-2 py-2" : "items-center py-2.5"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${
                      i < 3 ? "bg-lilac-500 text-white" : "bg-lilac-100 text-lilac-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-board block truncate text-sm">
                      {post.title}
                      {comments > 0 && <span className="ml-1 text-xs font-bold text-lilac-500">[{comments}]</span>}
                    </span>
                    {compact && (
                      <span className="block truncate text-[11px] text-ink-soft tabular-nums">
                        {post.profiles?.nickname ?? m.home.unknownUser} · {fmt(m.home.views, { n: post.view_count ?? 0 })}
                      </span>
                    )}
                  </span>
                  <span className={`shrink-0 text-xs text-ink-soft ${compact ? "hidden" : "hidden sm:inline"}`}>
                    {post.profiles?.nickname ?? m.home.unknownUser}
                  </span>
                  {!compact && (
                    <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                      {fmt(m.home.views, { n: post.view_count ?? 0 })} · {formatBoardDate(post.created_at)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
