"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

/** 다른 사이트로 튕겨나가지 않도록 내부 경로만 허용 */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function translateAuthError(message: string) {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않아요.";
  if (message.includes("Email not confirmed")) return "메일함에서 인증 링크를 먼저 눌러주세요.";
  if (message.includes("already registered")) return "이미 가입된 이메일이에요.";
  if (message.includes("Password should be")) return "비밀번호는 6자 이상이어야 해요.";
  if (message.includes("Database error saving new user")) return "이미 사용 중인 닉네임이에요.";
  if (message.toLowerCase().includes("rate limit")) return "잠시 후 다시 시도해 주세요.";
  return `문제가 생겼어요: ${message}`;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };

  redirect(safeNext(formData.get("next")));
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (nickname.length < 2 || nickname.length > 20) {
    return { error: "닉네임은 2~20자로 정해주세요." };
  }
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };

  const supabase = await createClient();

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();
  if (taken) return { error: "이미 사용 중인 닉네임이에요." };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: translateAuthError(error.message) };

  // 메일 인증을 끈 프로젝트면 바로 로그인 상태가 됩니다.
  if (data.session) redirect("/");

  return { message: `${email} 로 인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 끝나요.` };
}
