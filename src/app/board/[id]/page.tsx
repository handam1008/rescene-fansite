import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import BanNotice from "@/components/BanNotice";
import { CommentForm } from "@/components/BoardForms";
import Nickname from "@/components/Nickname";
import PostReactions from "@/components/PostReactions";
import ViewCounter from "@/components/ViewCounter";
import { SupabaseNotice } from "@/components/ui";
import { getMember, nameOf } from "@/data/members";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getPost, getPostPreview, getPosts, postImageUrl } from "@/lib/community";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { adminDeletePost, hidePost, restorePost } from "../../admin/actions";
import { deleteComment, deletePost } from "../actions";

/** 글 링크를 공유하면 미리보기에 글 제목과 첫 부분이 뜨게 (숨긴 글은 공개 조회에서 빠져서 기본값) */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = Number((await params).id);
  const post = Number.isInteger(id) && id > 0 ? await getPostPreview(id) : null;
  if (!post) return { title: (await getI18n()).m.board.title };
  const description = post.content.replace(/\s+/g, " ").trim().slice(0, 120);
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description: `${post.nickname} · ${description}` },
  };
}

const smallButton = "btn border border-lilac-200 bg-white px-3 py-1.5 text-sm hover:bg-lilac-50";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const { locale, m } = await getI18n();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [{ post, comments, myVote, reported }, user] = await Promise.all([getPost(id), getCurrentUser()]);
  if (!post) notFound();

  // 멤버 게시판 글이면 그 멤버 게시판으로 묶어서 보여줌
  const member = getMember(post.member);
  const boardPath = member ? `/members/${member.slug}/board` : "/board";
  const boardName = member ? fmt(m.board.memberBoard, { name: nameOf(member, locale) }) : m.board.title;
  const list = await getPosts(1, "all", member?.slug);

  const isOwner = user?.id === post.user_id;
  const newPath = member ? `/board/new?member=${member.slug}` : "/board/new";
  const writeHref = user ? newPath : `/login?next=${encodeURIComponent(newPath)}`;
  const images = post.image_paths ?? [];

  return (
    <div className="space-y-6">
      <ViewCounter postId={post.id} />

      <Link href={boardPath} className="inline-block text-lg font-extrabold text-lilac-700">
        {boardName}
      </Link>

      {post.hidden_at && (
        <p className="border border-blush-400 bg-blush-100 px-4 py-3 text-sm">
          {fmt(m.board.hiddenNotice, {
            reason: m.board.hiddenReasons[post.hidden_reason ?? "admin"],
            who: isOwner ? m.board.hiddenOwner : m.board.hiddenAdmin,
          })}
          {isOwner && m.board.hiddenOwnerHint}
        </p>
      )}

      <article className="border-t-2 border-lilac-500 bg-white">
        {/* 제목 · 글쓴이 정보 */}
        <header className="border-b border-lilac-200 px-4 py-3 sm:px-5">
          <h1 className="font-board text-lg font-bold break-words sm:text-xl">{post.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="flex min-w-0 items-center">
              <Nickname author={post.profiles} className="font-semibold text-ink" />
              <span className="mx-1.5 text-lilac-200">|</span>
              <span className="shrink-0">{formatFullDateTime(post.created_at)}</span>
              {post.edited_at && (
                <span className="ml-1.5 shrink-0" title={fmt(m.board.editedAt, { date: formatFullDateTime(post.edited_at) })}>
                  {m.board.edited}
                </span>
              )}
            </span>
            <span>
              {fmt(m.board.views, { n: post.view_count ?? 0 })}
              <span className="mx-1.5 text-lilac-200">|</span>
              {fmt(m.board.likes, { n: post.like_count ?? 0 })}
              <span className="mx-1.5 text-lilac-200">|</span>
              {fmt(m.board.comments, { n: comments.length })}
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
                  alt={fmt(m.board.attachAlt, { n: i + 1 })}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="mx-auto block h-auto max-h-[80vh] max-w-full"
                />
              ))}
            </div>
          )}
          <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{post.content}</div>
        </div>

        <PostReactions
          postId={post.id}
          likes={post.like_count ?? 0}
          dislikes={post.dislike_count ?? 0}
          myVote={myVote}
          reported={reported}
          loggedIn={!!user}
          canReact={!isOwner && !post.hidden_at && !user?.bannedUntil}
          isOwner={isOwner}
        />

        <div className="flex justify-between gap-2 border-t border-lilac-200 px-4 py-3 sm:px-5">
          <Link href={boardPath} className={smallButton}>
            {m.board.list}
          </Link>
          <div className="flex gap-2">
            {user?.isAdmin && !isOwner && (
              <>
                <form action={post.hidden_at ? restorePost : hidePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <button type="submit" className={smallButton}>
                    {post.hidden_at ? m.board.restore : m.board.hide}
                  </button>
                </form>
                <form action={adminDeletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="back" value={boardPath} />
                  <button type="submit" className={smallButton}>
                    {m.board.adminDelete}
                  </button>
                </form>
              </>
            )}
            {isOwner && (
              <Link href={`/board/${post.id}/edit`} className={smallButton}>
                {m.board.edit}
              </Link>
            )}
            {isOwner && (
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <button type="submit" className={smallButton}>
                  {m.board.delete}
                </button>
              </form>
            )}
            <Link href={writeHref} className={smallButton}>
              {m.board.write}
            </Link>
          </div>
        </div>
      </article>

      {/* 댓글 */}
      <section className="border-t-2 border-lilac-500 bg-white">
        <h2 className="border-b border-lilac-200 px-4 py-2.5 text-sm font-bold sm:px-5">
          {m.board.commentsBefore}
          <span className="text-lilac-500">{comments.length}</span>
          {m.board.commentsAfter}
        </h2>
        {comments.length > 0 && (
          <ul>
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 border-b border-lilac-100 px-4 py-2.5 text-sm sm:flex-row sm:gap-4 sm:px-5">
                <Nickname author={c.profiles} className="shrink-0 font-semibold sm:w-36" />
                <p className="min-w-0 flex-1 break-words whitespace-pre-wrap">{c.content}</p>
                <span className="flex shrink-0 items-start gap-2 text-xs text-ink-soft">
                  {formatFullDateTime(c.created_at).slice(5)}
                  {(user?.id === c.user_id || user?.isAdmin) && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="postId" value={post.id} />
                      <button type="submit" aria-label={m.board.deleteComment} className="hover:text-ink">✕</button>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="bg-lilac-50 px-4 py-3 sm:px-5">
          {user?.bannedUntil ? (
            <BanNotice until={user.bannedUntil} reason={user.banReason} />
          ) : user ? (
            <CommentForm postId={post.id} />
          ) : (
            <p className="text-sm text-ink-soft">
              <Link href={`/login?next=/board/${post.id}`} className="font-semibold text-lilac-700 underline">
                {m.board.login}
              </Link>
              {m.board.loginToComment}
            </p>
          )}
        </div>
      </section>

      {/* 디시처럼 글 아래에 목록 */}
      <BoardList
        posts={list.posts}
        notices={list.notices}
        total={list.total}
        page={1}
        tab="all"
        writeHref={writeHref}
        basePath={boardPath}
        showMember={!member}
        currentPostId={post.id}
      />
    </div>
  );
}
