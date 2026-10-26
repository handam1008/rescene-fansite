import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader, SupabaseNotice, buttonClass } from "@/components/ui";
import { getPosts, POSTS_PER_PAGE } from "@/lib/community";
import { formatDate } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "게시판" };

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader eyebrow="Board" title="게시판" />
        <SupabaseNotice />
      </>
    );
  }

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [{ posts, total }, user] = await Promise.all([getPosts(page), getCurrentUser()]);
  const lastPage = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader eyebrow="Board" title="게시판" description="리마인들의 자유 게시판이에요." />
        <Link href={user ? "/board/new" : "/login?next=/board/new"} className={`${buttonClass} mb-6 sm:mb-8`}>
          + 글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState>아직 글이 없어요. 첫 글을 남겨주세요!</EmptyState>
      ) : (
        <ul className="card divide-y divide-lilac-100">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/board/${post.id}`} className="block px-4 py-3 hover:bg-lilac-50">
                <p className="font-semibold break-words">
                  {post.title}
                  {post.comments[0]?.count > 0 && (
                    <span className="ml-1 text-sm text-lilac-500">[{post.comments[0].count}]</span>
                  )}
                </p>
                <p className="text-xs text-ink-soft">
                  {post.profiles?.nickname ?? "알 수 없음"} · {formatDate(post.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {lastPage > 1 && (
        <nav aria-label="페이지" className="mt-5 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? <Link href={`/board?page=${page - 1}`} className="underline">← 이전</Link> : <span />}
          <span className="text-ink-soft">
            {page} / {lastPage}
          </span>
          {page < lastPage ? <Link href={`/board?page=${page + 1}`} className="underline">다음 →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
