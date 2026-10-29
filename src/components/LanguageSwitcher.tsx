"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { GlobeIcon } from "./Icons";

/** 고른 언어를 쿠키에 1년 저장하고, 화면을 그 언어로 다시 그림 */
function saveLocale(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

type Suggestion = { question: string; yes: string; close: string };

/** 위쪽 줄 오른쪽의 언어 고르기 (🌐 한국어 ▾) */
export function LanguageSwitcher() {
  const { locale, m } = useI18n();
  const router = useRouter();
  return (
    <label className="flex items-center gap-1 text-ink-soft hover:text-ink">
      <GlobeIcon className="h-3.5 w-3.5" />
      <span className="sr-only">{m.top.language}</span>
      <select
        value={locale}
        onChange={(e) => {
          saveLocale(e.target.value as Locale);
          router.refresh();
        }}
        className="cursor-pointer bg-transparent py-0.5 font-semibold outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}

const DISMISS_KEY = "rescene-lang-suggest-dismissed";

/**
 * 처음 온 사람의 브라우저 언어가 일본어·영어면 "일본어로 볼까요?" 한 줄 (그 언어로).
 * 언어를 이미 고른 사람(쿠키), 닫은 사람에게는 안 보임. 검색 로봇은 쿠키가 없으니 한국어 페이지를 그대로 봄
 */
export function LanguageSuggestion({ suggestions }: { suggestions: Partial<Record<Locale, Suggestion>> }) {
  const router = useRouter();
  const [target, setTarget] = useState<Locale | null>(null);

  useEffect(() => {
    if (document.cookie.split("; ").some((c) => c.startsWith(`${LOCALE_COOKIE}=`))) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    const lang = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
    const l = lang.startsWith("ja") ? "ja" : lang.startsWith("en") ? "en" : null;
    if (l && suggestions[l]) setTarget(l);
  }, [suggestions]);

  if (!target) return null;
  const s = suggestions[target]!;

  const close = () => {
    setTarget(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="border-b border-lilac-200 bg-lilac-100 text-sm" lang={target}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 xl:px-6 wide:max-w-[1520px]">
        <span>{s.question}</span>
        <button
          type="button"
          onClick={() => {
            saveLocale(target);
            setTarget(null);
            router.refresh();
          }}
          className="bg-lilac-500 px-3 py-1 font-bold text-white hover:bg-lilac-700"
        >
          {s.yes}
        </button>
        <button type="button" onClick={close} aria-label={s.close} className="px-1 text-ink-soft hover:text-ink">
          ✕
        </button>
      </div>
    </div>
  );
}
