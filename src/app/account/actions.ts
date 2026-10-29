"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { safeNext } from "@/lib/auth-providers";
import { fmt, LOCALES } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { getI18n } from "@/i18n/server";
import { nicknameFormatOk } from "@/lib/nickname";
import { POST_IMAGE_BUCKET, PROOF_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function updateNickname(_prev: FormState, formData: FormData): Promise<FormState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const { m } = await getI18n();
  if (!nicknameFormatOk(nickname)) return { error: fmt(m.authPage.errNickRule, { rule: m.authPage.nickRule }) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // 대소문자·공백만 다른 닉네임, user_ 로 시작, 운영자 사칭 단어도 막음 (0010 nickname_available)
  const { data: available } = await supabase.rpc("nickname_available", { n: nickname });
  if (available === false) return { error: m.authPage.errNickUnavailable };

  const { error } = await supabase.from("profiles").update({ nickname }).eq("id", user.id);
  if (error) return { error: error.code === "23505" ? m.authPage.errNickInUse : m.account.errNickChange };

  revalidatePath("/", "layout");
  const next = formData.get("next");
  if (next) redirect(safeNext(next));
  return { message: m.account.nickChanged };
}

/**
 * 회원 탈퇴: 내 사진 파일을 지우고 → 계정 삭제(글·댓글·인증 기록이 함께 지워짐, 0009)
 * 확인 단어는 언어마다 다름 (탈퇴 / 退会 / DELETE). 폼을 연 뒤 언어를 바꿔도 되게 셋 다 받음
 */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const { m } = await getI18n();
  const typed = String(formData.get("confirm") ?? "").trim();
  if (!LOCALES.some((l) => dictionaries[l].account.deleteWord === typed)) {
    return { error: fmt(m.account.errDeleteConfirm, { word: m.account.deleteWord }) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // 저장소에 있는 내 사진(글 첨부·포카 인증). 내 폴더(<회원 id>/)만 지울 수 있음
  for (const bucket of [POST_IMAGE_BUCKET, PROOF_BUCKET]) {
    const { data: files } = await supabase.storage.from(bucket).list(user.id, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${user.id}/${f.name}`);
    if (paths.length > 0) await supabase.storage.from(bucket).remove(paths);
  }

  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { error: m.account.errDelete };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?bye=1");
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const t = (await getI18n()).m.authPage;
  if (password.length < 6) return { error: t.errPasswordLength };
  if (password !== String(formData.get("confirm") ?? "")) return { error: t.errPasswordMismatch };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.toLowerCase().includes("different from the old")) return { error: t.errPasswordSame };
    if (error.message.toLowerCase().includes("session")) return { error: t.errLinkExpired };
    return { error: t.errPasswordChange };
  }
  return { message: t.passwordChanged };
}
