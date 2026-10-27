import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/BoardForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getMember } from "@/data/members";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "글쓰기" };

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const member = getMember((await searchParams).member);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(member ? `/board/new?member=${member.slug}` : "/board/new")}`);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Board" title={member ? `${member.name} 게시판` : "게시판"} />
      <PostForm userId={user.id} defaultMember={member?.slug} />
    </div>
  );
}
