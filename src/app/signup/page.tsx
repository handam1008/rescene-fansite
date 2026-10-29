import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import SocialLogin from "@/components/SocialLogin";
import { getEnabledProviders } from "@/lib/auth-providers";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.authPage.signupTitle };
}

export default async function SignupPage() {
  const providers = isSupabaseConfigured ? await getEnabledProviders() : [];
  const { m } = await getI18n();
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Sign up" title={m.authPage.signupTitle} description={m.authPage.signupDesc} />
      {isSupabaseConfigured ? (
        <AuthForm mode="signup" social={<SocialLogin providers={providers} />} />
      ) : (
        <SupabaseNotice />
      )}
    </div>
  );
}
