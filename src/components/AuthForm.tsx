"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/auth/actions";
import { buttonClass, FormMessage, inputClass } from "./ui";

export default function AuthForm({
  mode,
  next,
  initialError,
}: {
  mode: "login" | "signup";
  next?: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    mode === "login" ? login : signup,
    initialError ? { error: initialError } : undefined,
  );
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="card space-y-4 p-6">
      {next && <input type="hidden" name="next" value={next} />}

      {isSignup && (
        <label className="block space-y-1">
          <span className="text-sm font-semibold">닉네임</span>
          <input name="nickname" required minLength={2} maxLength={20} className={inputClass} placeholder="2~20자" />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-sm font-semibold">이메일</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={inputClass}
          placeholder={isSignup ? "6자 이상" : undefined}
        />
      </label>

      <FormMessage error={state?.error} message={state?.message} />

      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "잠시만요…" : isSignup ? "가입하기" : "로그인"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {isSignup ? (
          <>
            이미 회원이에요 → <Link href="/login" className="font-semibold text-lilac-700 underline">로그인</Link>
          </>
        ) : (
          <>
            처음이에요 → <Link href="/signup" className="font-semibold text-lilac-700 underline">회원가입</Link>
          </>
        )}
      </p>
    </form>
  );
}
