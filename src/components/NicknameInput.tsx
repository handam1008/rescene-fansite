"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "./ui";

type Status = "idle" | "checking" | "ok" | "taken" | "short";

/**
 * 닉네임 입력칸. 적는 동안 쓸 수 있는 닉네임인지 바로 알려줌
 * (겹침·대소문자만 다름·user_·운영자 사칭 단어). 최종 확인은 저장할 때 서버와 DB 가 다시 함.
 */
export default function NicknameInput({ defaultValue = "", className = "" }: { defaultValue?: string; className?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const n = value.trim();
    if (!n || n === defaultValue.trim()) return setStatus("idle");
    if (n.length < 2) return setStatus("short");
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
    checking: "확인 중…",
    ok: "✓ 쓸 수 있는 닉네임이에요",
    taken: "이미 사용 중이거나 쓸 수 없는 닉네임이에요",
    short: "2자 이상 적어주세요",
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
        placeholder="2~20자"
        aria-label="닉네임"
        aria-invalid={status === "taken"}
        className={`${inputClass} ${status === "taken" ? "border-blush-400" : ""}`}
      />
      {message[status] && (
        <p className={`text-xs ${status === "ok" ? "text-emerald-700" : status === "checking" ? "text-ink-soft" : "text-red-600"}`}>
          {message[status]}
        </p>
      )}
    </div>
  );
}
