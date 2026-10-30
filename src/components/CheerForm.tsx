"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/auth/actions";
import { addCheer } from "@/app/cheer/actions";
import { members, nameOf } from "@/data/members";
import { useI18n } from "@/i18n/client";
import { buttonClass, FormMessage, inputClass } from "./ui";

/** 롤링페이퍼에 응원 붙이기: 받는 멤버(쪽지 색) + 한마디 */
export default function CheerForm({ paperId }: { paperId: string }) {
  const { m, locale } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(addCheer, undefined);
  const [to, setTo] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  const color = members.find((x) => x.slug === to)?.color ?? "#e0d4ff";

  return (
    <form ref={formRef} action={action} className="space-y-3 border-2 p-4" style={{ borderColor: color, backgroundColor: `${color}33` }}>
      <input type="hidden" name="paperId" value={paperId} />
      <input type="hidden" name="member" value={to} />
      <div>
        <p className="mb-1.5 text-sm font-semibold">{m.cheer.to}</p>
        <div className="flex flex-wrap gap-1.5">
          {[{ slug: "", label: m.cheer.toAll, color: "#e0d4ff" }, ...members.map((x) => ({ slug: x.slug as string, label: nameOf(x, locale), color: x.color }))].map((o) => (
            <button
              key={o.slug || "all"}
              type="button"
              aria-pressed={to === o.slug}
              onClick={() => setTo(o.slug)}
              className={`border-2 px-2.5 py-1 text-xs font-bold ${to === o.slug ? "text-ink" : "border-lilac-200 bg-white text-ink-soft"}`}
              style={to === o.slug ? { backgroundColor: o.color, borderColor: o.color } : undefined}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <textarea name="content" required maxLength={100} rows={3} placeholder={m.cheer.placeholder} className={`${inputClass} resize-none`} />
      <FormMessage error={state?.error} />
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? m.cheer.sending : `📌 ${m.cheer.send}`}
        </button>
      </div>
    </form>
  );
}
