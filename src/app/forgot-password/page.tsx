import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/PasswordForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.authPage.forgotTitle };
}

export default async function ForgotPasswordPage() {
  const { m } = await getI18n();
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Password" title={m.authPage.forgotTitle} description={m.authPage.forgotDesc} />
      {isSupabaseConfigured ? <ForgotPasswordForm /> : <SupabaseNotice />}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-lilac-700 underline">
          {m.authPage.backToLogin}
        </Link>
      </p>
    </div>
  );
}
