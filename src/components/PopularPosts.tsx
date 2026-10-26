import Link from "next/link";
import { formatBoardDate } from "@/lib/format";
import type { PostSummary } from "@/types";
import { MoreLink } from "./ui";

/** 홈 화면 인기글: 최근 일주일 조회수 순위 */
export default function PopularPosts({ posts }: { posts: PostSummary[] }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">🔥 인기글</h2>
        <MoreLink href="/board?tab=best">더 보기</MoreLink>
      </div>

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          아직 글이 없어요.{" "}
          <Link href="/board" className="font-semibold text-lilac-700 underline">
            게시판
          </Link>
          에 첫 글을 남겨주세요!
        </p>
      ) : (
        <ol className="mt-3 divide-y divide-lilac-100">
          {posts.map((post, i) => {
            const comments = post.comments[0]?.count ?? 0;
            return (
              <li key={post.id}>
                <Link href={`/board/${post.id}`} className="flex items-center gap-3 py-2.5 hover:bg-lilac-50">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${
                      i < 3 ? "bg-lilac-500 text-white" : "bg-lilac-100 text-lilac-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {post.title}
                    {comments > 0 && <span className="ml-1 text-xs font-bold text-lilac-500">[{comments}]</span>}
                  </span>
                  <span className="hidden shrink-0 text-xs text-ink-soft sm:inline">
                    {post.profiles?.nickname ?? "알 수 없음"}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                    조회 {post.view_count ?? 0} · {formatBoardDate(post.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
