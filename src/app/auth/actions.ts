"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

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

  // 대소문자·공백만 다른 닉네임, 운영자 사칭 단어도 막음 (0010 nickname_available)
  const { data: available } = await supabase.rpc("nickname_available", { n: nickname });
  if (available === false) return { error: "이미 사용 중이거나 쓸 수 없는 닉네임이에요." };

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

/**
 * 비밀번호 재설정 메일 보내기. 가입된 이메일인지 아닌지는 알려주지 않음 (남의 가입 여부를 알아내지 못하게).
 * 메일의 링크는 /auth/confirm 으로 돌아와 로그인시킨 뒤 새 비밀번호 화면(/account/password)으로 보냄
 */
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "이메일을 정확히 적어주세요." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/account/password`,
  });
  if (error?.message.toLowerCase().includes("rate limit")) {
    return { error: "메일을 너무 자주 보냈어요. 잠시 후 다시 시도해 주세요." };
  }
  return { message: `${email} 로 가입되어 있다면 비밀번호 재설정 메일을 보냈어요. 메일함(스팸함도)을 확인해 주세요.` };
}
