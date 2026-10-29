"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/auth/actions";
import { sendInquiry } from "@/app/contact/actions";
import { useI18n } from "@/i18n/client";
import { INQUIRY_CATEGORIES } from "@/lib/inquiries";
import { buttonClass, FormMessage, inputClass } from "./ui";

export default function ContactForm() {
  const t = useI18n().m.contact;
  const [state, action, pending] = useActionState<FormState, FormData>(sendInquiry, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // 보내고 나면 내용 칸 비우기
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="card space-y-3 p-5">
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">{t.category}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {INQUIRY_CATEGORIES.map((c, i) => (
            <label key={c} className="flex items-center gap-1.5">
              <input type="radio" name="category" value={c} defaultChecked={i === 0} required />
              {t.categories[c]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">{t.content}</span>
        <textarea
          name="content"
          required
          maxLength={2000}
          rows={7}
          placeholder={t.placeholder}
          className={`${inputClass} leading-relaxed`}
        />
      </label>
      <p className="text-xs text-ink-soft">{t.note}</p>
      <FormMessage error={state?.error} message={state?.message} />
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? t.sending : t.send}
        </button>
      </div>
    </form>
  );
}
