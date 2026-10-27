"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/auth/actions";
import NicknameInput from "./NicknameInput";
import { buttonClass, FormMessage, inputClass } from "./ui";

export default function AuthForm({
  mode,
  next,
  initialError,
  social,
}: {
  mode: "login" | "signup";
  next?: string;
  initialError?: string;
  /** 위에 보여줄 소셜 로그인 버튼 */
  social?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    mode === "login" ? login : signup,
    initialError ? { error: initialError } : undefined,
  );
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="card space-y-4 p-6">
      {social}
      {next && <input type="hidden" name="next" value={next} />}

      {isSignup && (
        <label className="block space-y-1">
          <span className="text-sm font-semibold">닉네임</span>
          <NicknameInput />
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

      {isSignup && (
        <p className="text-xs leading-relaxed text-ink-soft">
          만 14세 이상만 가입할 수 있어요. 이메일·닉네임은 회원 관리에만 쓰고, 탈퇴하면 바로 지워요. 자세한 내용은{" "}
          <Link href="/privacy" className="underline hover:text-ink">
            개인정보처리방침
          </Link>
          에 있어요.
        </p>
      )}

      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "잠시만요…" : isSignup ? "가입하기" : "로그인"}
      </button>

      {!isSignup && (
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-ink-soft underline hover:text-ink">
            비밀번호를 잊었어요
          </Link>
        </p>
      )}

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
