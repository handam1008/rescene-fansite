import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import SocialLogin from "@/components/SocialLogin";
import { getEnabledProviders, safeNext } from "@/lib/auth-providers";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const providers = isSupabaseConfigured ? await getEnabledProviders() : [];

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Login" title="로그인" />
      {isSupabaseConfigured ? (
        <AuthForm
          mode="login"
          next={next}
          initialError={
            error === "confirm"
              ? "인증 링크가 만료됐어요. 다시 가입하거나 로그인해 주세요."
              : error === "social"
                ? "소셜 로그인을 마치지 못했어요. 다시 시도해 주세요."
                : error === "reset"
                  ? "비밀번호 재설정 링크가 만료됐거나 잘못됐어요. 비밀번호 찾기를 다시 해주세요."
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
