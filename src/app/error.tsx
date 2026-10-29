"use client";

import { useI18n } from "@/i18n/client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { m } = useI18n();
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="font-bold">{m.error.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{m.error.desc}</p>
      <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-lilac-700 underline">
        {m.error.retry}
      </button>
    </div>
  );
}
