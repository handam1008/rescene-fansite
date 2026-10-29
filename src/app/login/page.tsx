import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import SocialLogin from "@/components/SocialLogin";
import { getEnabledProviders, safeNext } from "@/lib/auth-providers";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.authPage.loginTitle };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const { m } = await getI18n();
  const providers = isSupabaseConfigured ? await getEnabledProviders() : [];

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Login" title={m.authPage.loginTitle} />
      {isSupabaseConfigured ? (
        <AuthForm
          mode="login"
          next={next}
          initialError={
            error === "confirm"
              ? m.authPage.errConfirm
              : error === "social"
                ? m.authPage.errSocial
                : error === "reset"
                  ? m.authPage.errReset
                  : undefined
          }
          social={<SocialLogin providers={providers} next={safeNext(next)} />}
        />
      ) : (
        <SupabaseNotice />
      )}
    </div>
  );
}
