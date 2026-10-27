import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/PasswordForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "비밀번호 찾기" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Password" title="비밀번호 찾기" description="가입한 이메일로 비밀번호를 새로 정하는 링크를 보내드려요." />
      {isSupabaseConfigured ? <ForgotPasswordForm /> : <SupabaseNotice />}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-lilac-700 underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
