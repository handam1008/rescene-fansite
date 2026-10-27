"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/account/actions";
import { requestPasswordReset } from "@/app/auth/actions";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">가입한 이메일</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <FormMessage error={state?.error} message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "보내는 중…" : "재설정 메일 보내기"}
      </button>
      <p className="text-xs text-ink-soft">구글·카카오로 가입했다면 비밀번호 없이 그 버튼으로 로그인하면 돼요.</p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">새 비밀번호</span>
        <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="6자 이상" className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">새 비밀번호 확인</span>
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
      </label>
      <FormMessage error={state?.error} message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}
