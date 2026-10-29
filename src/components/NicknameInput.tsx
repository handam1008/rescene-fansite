"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { nicknameFormatOk } from "@/lib/nickname";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "./ui";

type Status = "idle" | "checking" | "ok" | "taken" | "short" | "format";

/**
 * 닉네임 입력칸. 적는 동안 쓸 수 있는 닉네임인지 바로 알려줌
 * (겹침·대소문자만 다름·user_·운영자 사칭 단어). 최종 확인은 저장할 때 서버와 DB 가 다시 함.
 */
export default function NicknameInput({ defaultValue = "", className = "" }: { defaultValue?: string; className?: string }) {
  const t = useI18n().m.authPage;
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const n = value.trim();
    if (!n || n === defaultValue.trim()) return setStatus("idle");
    if (n.length < 2) return setStatus("short");
    if (!nicknameFormatOk(n)) return setStatus("format");
    setStatus("checking");
    // 글자를 칠 때마다 묻지 않도록 0.4초 기다렸다가 확인
    const timer = setTimeout(async () => {
      const { data, error } = await createClient().rpc("nickname_available", { n });
      setStatus(error ? "idle" : data ? "ok" : "taken");
    }, 400);
    return () => clearTimeout(timer);
  }, [value, defaultValue]);

  const message: Record<Status, string | null> = {
    idle: null,
    checking: t.nickChecking,
    ok: t.nickOk,
    taken: t.nickTaken,
    short: t.nickShort,
    format: t.nickRule,
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <input
        name="nickname"
        required
        minLength={2}
        maxLength={20}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.nickPlaceholder}
        aria-label={t.nickname}
        aria-invalid={status === "taken" || status === "format"}
        className={`${inputClass} ${status === "taken" || status === "format" ? "border-blush-400" : ""}`}
      />
      {status === "idle" && <p className="text-xs text-ink-soft">{t.nickRule}</p>}
      {message[status] && (
        <p className={`text-xs ${status === "ok" ? "text-emerald-700" : status === "checking" ? "text-ink-soft" : "text-red-600"}`}>
          {message[status]}
        </p>
      )}
    </div>
  );
}
