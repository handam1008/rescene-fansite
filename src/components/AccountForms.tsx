"use client";

import { useActionState } from "react";
import { deleteAccount, updateNickname } from "@/app/account/actions";
import { useI18n } from "@/i18n/client";
import NicknameInput from "./NicknameInput";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function NicknameForm({ current, next }: { current: string; next?: string }) {
  const t = useI18n().m.account;
  const [state, action, pending] = useActionState(updateNickname, undefined);
  return (
    <form action={action} className="space-y-2">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex items-start gap-2">
        <NicknameInput defaultValue={current.startsWith("user_") ? "" : current} className="min-w-0 flex-1" />
        <button type="submit" disabled={pending} className={`${buttonClass} shrink-0`}>
          {pending ? t.saving : t.save}
        </button>
      </div>
      <FormMessage error={state?.error} message={state?.message} />
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useI18n().m.account;
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form action={action} className="space-y-2">
      <p className="text-sm text-ink-soft">
        {t.deleteDesc}
      </p>
      <div className="flex gap-2">
        <input name="confirm" placeholder={t.deletePlaceholder} aria-label={t.deleteAria} className={`${inputClass} min-w-0 flex-1`} />
        <button type="submit" disabled={pending} className="shrink-0 border border-ink bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {pending ? t.processing : t.deleteButton}
        </button>
      </div>
      <FormMessage error={state?.error} />
    </form>
  );
}
