import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/BoardForms";
import { SupabaseNotice } from "@/components/ui";
import { getPost } from "@/lib/community";
import { formatDate, formatDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { deleteComment, deletePost } from "../actions";

export const metadata: Metadata = { title: "게시판" };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [{ post, comments }, user] = await Promise.all([getPost(id), getCurrentUser()]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/board" className="text-sm text-lilac-700 underline">
        ← 목록으로
      </Link>

      <article className="card p-5 sm:p-6">
        <h1 className="text-xl font-extrabold break-words sm:text-2xl">{post.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
          <span>
            {post.profiles?.nickname ?? "알 수 없음"} · {formatDateTime(post.created_at)}
          </span>
          {user?.id === post.user_id && (
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" className="underline hover:text-ink">삭제</button>
            </form>
          )}
        </div>
        {/* 글 내용은 텍스트로만 출력 (HTML로 해석하지 않음) */}
        <div className="mt-5 border-t border-lilac-100 pt-5 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-3 font-bold">댓글 {comments.length}</h2>
        {comments.length > 0 && (
          <ul className="mb-4 divide-y divide-lilac-100">
            {comments.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="font-semibold text-ink">{c.profiles?.nickname ?? "알 수 없음"}</span>
                  <span>{formatDate(c.created_at)}</span>
                  {user?.id === c.user_id && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="postId" value={post.id} />
                      <button type="submit" className="underline hover:text-ink">삭제</button>
                    </form>
                  )}
                </div>
                <p className="mt-1 text-sm break-words whitespace-pre-wrap">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-ink-soft">
            <Link href={`/login?next=/board/${post.id}`} className="font-semibold text-lilac-700 underline">로그인</Link>
            하면 댓글을 남길 수 있어요.
          </p>
        )}
      </section>
    </div>
  );
}
