import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/BoardForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "글쓰기" };

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/board/new");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Board" title="글쓰기" />
      <PostForm />
    </div>
  );
}
