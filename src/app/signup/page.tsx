import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import SocialLogin from "@/components/SocialLogin";
import { getEnabledProviders } from "@/lib/auth-providers";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage() {
  const providers = isSupabaseConfigured ? await getEnabledProviders() : [];
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Sign up" title="회원가입" description="가입하면 포카를 올리고 게시판에 글을 쓸 수 있어요." />
      {isSupabaseConfigured ? (
        <AuthForm mode="signup" social={<SocialLogin providers={providers} />} />
      ) : (
        <SupabaseNotice />
      )}
    </div>
  );
}
