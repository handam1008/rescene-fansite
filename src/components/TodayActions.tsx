"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";

/**
 * /today 카드 아래 버튼: 이미지 저장 · 이미지 공유(휴대폰) · X 글쓰기 · 글 복사.
 * X 글쓰기 창에는 이미지를 자동으로 붙일 수 없어서, 저장한 뒤 직접 붙이도록 안내
 */
export default function TodayActions({ imageUrl, fileName, postText }: { imageUrl: string; fileName: string; postText: string }) {
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);
  const btn = "inline-flex items-center justify-center gap-1.5 border px-4 py-2.5 text-sm font-bold";

  async function shareImage() {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: postText });
        return;
      }
    } catch {
      // 취소했거나 지원하지 않으면 저장으로
    }
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = fileName;
    a.click();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a href={imageUrl} download={fileName} className={`${btn} border-lilac-500 bg-lilac-500 text-white`}>
          ⬇️ {m.today.save}
        </a>
        <button type="button" onClick={shareImage} className={`${btn} border-lilac-300 bg-white text-lilac-700`}>
          📤 {m.today.shareImage}
        </button>
        <a
          href={`https://x.com/intent/post?${new URLSearchParams({ text: postText })}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} border-ink bg-ink text-white`}
        >
          {m.today.postX}
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard?.writeText(postText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`${btn} border-lilac-300 bg-white text-lilac-700`}
        >
          📋 {copied ? m.today.copied : m.today.copyText}
        </button>
      </div>
      <p className="text-xs text-ink-soft">{m.today.xHint}</p>
      <pre className="border border-lilac-200 bg-white p-3 text-xs leading-relaxed break-all whitespace-pre-wrap text-ink-soft">{postText}</pre>
    </div>
  );
}
