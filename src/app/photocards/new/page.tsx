import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PhotocardForm from "@/components/PhotocardForm";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "포카 올리기" };

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function NewPhotocardPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/photocards/new");

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Photocard" title="포카 올리기" />
      <PhotocardForm userId={user.id} />
    </div>
  );
}
