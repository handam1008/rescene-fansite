import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/PasswordForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "비밀번호 바꾸기", robots: { index: false } };

export const dynamic = "force-dynamic";

/** 새 비밀번호 정하기: 비밀번호 재설정 메일의 링크로 들어오거나, 내 정보에서 들어옴 */
export default async function NewPasswordPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=reset");

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Password" title="비밀번호 바꾸기" description="앞으로 로그인할 때 쓸 새 비밀번호를 정해주세요." />
      <NewPasswordForm />
    </div>
  );
}
