"use client";

import { useState } from "react";
import type { SocialProvider } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/client";
import { FormMessage } from "./ui";

const base = "flex h-11 w-full items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-60";

const buttons: Record<SocialProvider, { label: string; className: string; icon: React.ReactNode }> = {
  kakao: {
    label: "카카오로 시작하기",
    className: "bg-[#FEE500] text-black/85 hover:brightness-95",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.84 5.18 4.6 6.55l-.94 3.44c-.08.3.26.55.52.37l4.1-2.72c.56.08 1.13.12 1.72.12 5.52 0 10-3.48 10-7.76S17.52 3 12 3Z"
        />
      </svg>
    ),
  },
  naver: {
    label: "네이버로 시작하기",
    className: "bg-[#03C75A] text-white hover:brightness-95",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path fill="currentColor" d="M16.27 12.84 7.46 0H0v24h7.73V11.16L16.54 24H24V0h-7.73z" />
      </svg>
    ),
  },
  google: {
    label: "Google로 시작하기",
    className: "border border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f8f9fa]",
    icon: (
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    ),
  },
};

/** 소셜 로그인 버튼. 켜져 있는 것만 받아서 보여줌 (lib/auth-providers.ts) */
export default function SocialLogin({ providers, next = "/" }: { providers: SocialProvider[]; next?: string }) {
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string>();
  if (providers.length === 0) return null;

  async function start(provider: SocialProvider) {
    setBusy(provider);
    setError(undefined);
    if (provider === "naver") {
      // 네이버는 사이트 서버가 직접 처리
      window.location.href = `/auth/naver?next=${encodeURIComponent(next)}`;
      return;
    }
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setBusy(null);
      setError("로그인 화면을 열지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <div className="space-y-2">
      {providers.map((p) => (
        <button key={p} type="button" onClick={() => start(p)} disabled={busy !== null} className={`${base} ${buttons[p].className}`}>
          {buttons[p].icon}
          {busy === p ? "이동 중…" : buttons[p].label}
        </button>
      ))}
      <FormMessage error={error} />
      <div className="flex items-center gap-3 py-2 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-lilac-200" />
        또는 이메일로
        <span className="h-px flex-1 bg-lilac-200" />
      </div>
    </div>
  );
}
