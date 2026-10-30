"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";

/**
 * 공유 버튼: X 에 글쓰기 · (휴대폰) 공유하기 · 링크 복사.
 * path 를 주면 그 화면 주소, 없으면 지금 보는 주소. text 는 X 글에 같이 들어갈 문장
 */
export default function ShareButtons({ text, path, className = "" }: { text: string; path?: string; className?: string }) {
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);
  const url = () => (path ? new URL(path, window.location.origin).toString() : window.location.href);

  const btn = "inline-flex items-center gap-1.5 border border-lilac-300 bg-white px-3 py-1.5 text-xs font-semibold text-lilac-700 hover:bg-lilac-50";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        className={btn}
        onClick={() => {
          const q = new URLSearchParams({ text: `${text}\n#RESCENE #리센느`, url: url() });
          window.open(`https://x.com/intent/post?${q}`, "_blank", "noopener,noreferrer");
        }}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7 4.2H5Z" />
        </svg>
        {m.share.x}
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          // 휴대폰은 카톡·인스타 등으로 바로 공유, 안 되면 링크 복사
          if (navigator.share) {
            try {
              await navigator.share({ title: text, url: url() });
              return;
            } catch {
              return;
            }
          }
          await navigator.clipboard?.writeText(url());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <span aria-hidden>🔗</span>
        {copied ? m.share.copied : m.share.more}
      </button>
    </div>
  );
}
