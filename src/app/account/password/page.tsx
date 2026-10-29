import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/PasswordForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.authPage.newPasswordTitle, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** 새 비밀번호 정하기: 비밀번호 재설정 메일의 링크로 들어오거나, 내 정보에서 들어옴 */
export default async function NewPasswordPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=reset");
  const { m } = await getI18n();

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Password" title={m.authPage.newPasswordTitle} description={m.authPage.newPasswordDesc} />
      <NewPasswordForm />
    </div>
  );
}
