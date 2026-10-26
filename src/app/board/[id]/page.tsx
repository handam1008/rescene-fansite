import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import { CommentForm } from "@/components/BoardForms";
import ViewCounter from "@/components/ViewCounter";
import { SupabaseNotice } from "@/components/ui";
import { getPost, getPosts, postImageUrl } from "@/lib/community";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { deleteComment, deletePost } from "../actions";

export const metadata: Metadata = { title: "게시판" };

const smallButton = "border border-lilac-200 bg-white px-3 py-1.5 text-sm hover:bg-lilac-50";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [{ post, comments }, user, list] = await Promise.all([getPost(id), getCurrentUser(), getPosts(1)]);
  if (!post) notFound();

  const isOwner = user?.id === post.user_id;
  const writeHref = user ? "/board/new" : "/login?next=/board/new";
  const images = post.image_paths ?? [];

  return (
    <div className="space-y-6">
      <ViewCounter postId={post.id} />

      <Link href="/board" className="inline-block text-lg font-extrabold text-lilac-700">
        게시판
      </Link>

      <article className="border-t-2 border-lilac-500 bg-white">
        {/* 제목 · 글쓴이 정보 */}
        <header className="border-b border-lilac-200 px-4 py-3 sm:px-5">
          <h1 className="text-lg font-bold break-words sm:text-xl">{post.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span>
              <span className="font-semibold text-ink">{post.profiles?.nickname ?? "알 수 없음"}</span>
              <span className="mx-1.5 text-lilac-200">|</span>
              {formatFullDateTime(post.created_at)}
            </span>
            <span>
              조회 {post.view_count ?? 0}
              <span className="mx-1.5 text-lilac-200">|</span>
              댓글 {comments.length}
            </span>
          </div>
        </header>

        {/* 본문: 텍스트로만 출력 (HTML로 해석하지 않음) */}
        <div className="min-h-40 px-4 py-6 sm:px-5">
          {images.length > 0 && (
            <div className="mb-5 space-y-3">
              {images.map((path, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 이미지
                <img
                  key={path}
                  src={postImageUrl(path)}
                  alt={`첨부 사진 ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="mx-auto block h-auto max-h-[80vh] max-w-full"
                />
              ))}
            </div>
          )}
          <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{post.content}</div>
        </div>

        <div className="flex justify-between gap-2 border-t border-lilac-200 px-4 py-3 sm:px-5">
          <Link href="/board" className={smallButton}>
            목록
          </Link>
          <div className="flex gap-2">
            {isOwner && (
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <button type="submit" className={smallButton}>삭제</button>
              </form>
            )}
            <Link href={writeHref} className={smallButton}>
              글쓰기
            </Link>
          </div>
        </div>
      </article>

      {/* 댓글 */}
      <section className="border-t-2 border-lilac-500 bg-white">
        <h2 className="border-b border-lilac-200 px-4 py-2.5 text-sm font-bold sm:px-5">
          전체 댓글 <span className="text-lilac-500">{comments.length}</span>개
        </h2>
        {comments.length > 0 && (
          <ul>
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 border-b border-lilac-100 px-4 py-2.5 text-sm sm:flex-row sm:gap-4 sm:px-5">
                <span className="shrink-0 font-semibold sm:w-28 sm:truncate">{c.profiles?.nickname ?? "알 수 없음"}</span>
                <p className="min-w-0 flex-1 break-words whitespace-pre-wrap">{c.content}</p>
                <span className="flex shrink-0 items-start gap-2 text-xs text-ink-soft">
                  {formatFullDateTime(c.created_at).slice(5)}
                  {user?.id === c.user_id && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="postId" value={post.id} />
                      <button type="submit" aria-label="댓글 삭제" className="hover:text-ink">✕</button>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="bg-lilac-50 px-4 py-3 sm:px-5">
          {user ? (
            <CommentForm postId={post.id} />
          ) : (
            <p className="text-sm text-ink-soft">
              <Link href={`/login?next=/board/${post.id}`} className="font-semibold text-lilac-700 underline">
                로그인
              </Link>
              하면 댓글을 남길 수 있어요.
            </p>
          )}
        </div>
      </section>

      {/* 디시처럼 글 아래에 목록 */}
      <BoardList posts={list.posts} total={list.total} page={1} tab="all" writeHref={writeHref} currentPostId={post.id} />
    </div>
  );
}
