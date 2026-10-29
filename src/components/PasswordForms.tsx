"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/account/actions";
import { requestPasswordReset } from "@/app/auth/actions";
import { useI18n } from "@/i18n/client";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function ForgotPasswordForm() {
  const t = useI18n().m.authPage;
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.forgotEmail}</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <FormMessage error={state?.error} message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? t.sending : t.sendReset}
      </button>
      <p className="text-xs text-ink-soft">{t.socialNoPassword}</p>
    </form>
  );
}

export function NewPasswordForm() {
  const t = useI18n().m.authPage;
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.newPassword}</span>
        <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder={t.passwordPlaceholder} className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.newPasswordConfirm}</span>
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
      </label>
      <FormMessage error={state?.error} message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? t.changing : t.changePassword}
      </button>
    </form>
  );
}
