"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth-providers";
import { fmt } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { getI18n } from "@/i18n/server";
import { nicknameFormatOk } from "@/lib/nickname";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

function translateAuthError(message: string, t: Messages["authPage"]) {
  if (message.includes("Invalid login credentials")) return t.errInvalid;
  if (message.includes("Email not confirmed")) return t.errNotConfirmed;
  if (message.includes("already registered")) return t.errRegistered;
  if (message.includes("Password should be")) return t.errPasswordLength;
  if (message.includes("Database error saving new user")) return t.errNickInUse;
  if (message.toLowerCase().includes("rate limit")) return t.errRateLimit;
  return fmt(t.errUnknown, { msg: message });
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const t = (await getI18n()).m.authPage;
  if (!email || !password) return { error: t.errEmailPassword };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message, t) };

  redirect(safeNext(formData.get("next")));
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const t = (await getI18n()).m.authPage;
  if (!nicknameFormatOk(nickname)) return { error: fmt(t.errNickRule, { rule: t.nickRule }) };
  if (password.length < 6) return { error: t.errPasswordLength };

  const supabase = await createClient();

  // 대소문자·공백만 다른 닉네임, 운영자 사칭 단어도 막음 (0010 nickname_available)
  const { data: available } = await supabase.rpc("nickname_available", { n: nickname });
  if (available === false) return { error: t.errNickUnavailable };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: translateAuthError(error.message, t) };

  // 메일 인증을 끈 프로젝트면 바로 로그인 상태가 됩니다.
  if (data.session) redirect("/");

  return { message: fmt(t.signupSent, { email }) };
}

/**
 * 비밀번호 재설정 메일 보내기. 가입된 이메일인지 아닌지는 알려주지 않음 (남의 가입 여부를 알아내지 못하게).
 * 메일의 링크는 /auth/confirm 으로 돌아와 로그인시킨 뒤 새 비밀번호 화면(/account/password)으로 보냄
 */
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const t = (await getI18n()).m.authPage;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: t.errEmailFormat };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/account/password`,
  });
  if (error?.message.toLowerCase().includes("rate limit")) {
    return { error: t.errMailRate };
  }
  return { message: fmt(t.resetSent, { email }) };
}
