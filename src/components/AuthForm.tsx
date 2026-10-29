"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/auth/actions";
import { useI18n } from "@/i18n/client";
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
  const t = useI18n().m.authPage;

  return (
    <form action={formAction} className="card space-y-4 p-6">
      {social}
      {next && <input type="hidden" name="next" value={next} />}

      {isSignup && (
        <label className="block space-y-1">
          <span className="text-sm font-semibold">{t.nickname}</span>
          <NicknameInput />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.email}</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.password}</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={inputClass}
          placeholder={isSignup ? t.passwordPlaceholder : undefined}
        />
      </label>

      <FormMessage error={state?.error} message={state?.message} />

      {isSignup && (
        <p className="text-xs leading-relaxed text-ink-soft">
          {t.agreeBefore}
          <Link href="/privacy" className="underline hover:text-ink">
            {t.agreeLink}
          </Link>
          {t.agreeAfter}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? t.wait : isSignup ? t.signupButton : t.loginButton}
      </button>

      {!isSignup && (
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-ink-soft underline hover:text-ink">
            {t.forgot}
          </Link>
        </p>
      )}

      <p className="text-center text-sm text-ink-soft">
        {isSignup ? (
          <>
            {t.haveAccount}
            <Link href="/login" className="font-semibold text-lilac-700 underline">
              {t.loginTitle}
            </Link>
          </>
        ) : (
          <>
            {t.firstTime}
            <Link href="/signup" className="font-semibold text-lilac-700 underline">
              {t.signupTitle}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
