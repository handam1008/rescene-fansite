"use client";

import { useState, useTransition } from "react";
import { translateItem, type TranslateResult } from "@/app/board/translate";
import { useI18n } from "@/i18n/client";

/**
 * 글·댓글 아래 "日本語に翻訳" 버튼. 누르면 번역을 아래에 보여주고, 다시 누르면 접음.
 * 한 번 받은 번역은 기억해서 다시 펼칠 때 서버에 또 묻지 않음
 */
export default function TranslateButton({ kind, id }: { kind: "post" | "comment"; id: number }) {
  const { m } = useI18n();
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (open) return setOpen(false);
    setOpen(true);
    if (result && !result.error) return;
    startTransition(async () => setResult(await translateItem(kind, id)));
  }

  return (
    <div className={kind === "post" ? "mt-5" : "mt-1"}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs font-semibold text-lilac-700 hover:underline"
      >
        <span aria-hidden>🌐</span>
        {pending ? m.board.translating : open ? m.board.showOriginal : m.board.translate}
      </button>
      {open && result && (
        <div className={`mt-2 border-l-4 border-lilac-300 bg-lilac-50 px-3 py-2 ${kind === "post" ? "text-[15px]" : "text-sm"}`}>
          {result.error ? (
            <p className="text-xs text-red-600">{result.error}</p>
          ) : (
            <>
              {result.title && <p className="mb-1.5 font-bold break-words">{result.title}</p>}
              <p className="leading-relaxed break-words whitespace-pre-wrap">{result.text}</p>
              <p className="mt-1.5 text-[11px] text-ink-soft">{m.board.translatedBy}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
