import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/BoardForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { getPost } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.board.editPost };
}

export const dynamic = "force-dynamic";

/** 글 수정: 글쓴이만 (실제로 막는 건 DB 규칙 "users edit own posts", 0010) */
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/board/${id}/edit`);

  const { post } = await getPost(id);
  if (!post) notFound();
  if (post.user_id !== user.id) redirect(`/board/${id}`);
  const { m } = await getI18n();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Board" title={m.board.editPost} />
      <PostForm
        userId={user.id}
        editing={{
          id: post.id,
          title: post.title,
          content: post.content,
          member: post.member ?? null,
          image_paths: post.image_paths ?? [],
        }}
      />
    </div>
  );
}
