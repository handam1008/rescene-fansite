"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { safeNext } from "@/lib/auth-providers";
import { POST_IMAGE_BUCKET, PROOF_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function updateNickname(_prev: FormState, formData: FormData): Promise<FormState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (nickname.length < 2 || nickname.length > 20) return { error: "닉네임은 2~20자로 정해주세요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // 대소문자·공백만 다른 닉네임, user_ 로 시작, 운영자 사칭 단어도 막음 (0010 nickname_available)
  const { data: available } = await supabase.rpc("nickname_available", { n: nickname });
  if (available === false) return { error: "이미 사용 중이거나 쓸 수 없는 닉네임이에요." };

  const { error } = await supabase.from("profiles").update({ nickname }).eq("id", user.id);
  if (error) return { error: error.code === "23505" ? "이미 사용 중인 닉네임이에요." : "닉네임을 바꾸지 못했어요." };

  revalidatePath("/", "layout");
  const next = formData.get("next");
  if (next) redirect(safeNext(next));
  return { message: "닉네임을 바꿨어요." };
}

/** 회원 탈퇴: 내 사진 파일을 지우고 → 계정 삭제(글·댓글·인증 기록이 함께 지워짐, 0009) */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("confirm") ?? "").trim() !== "탈퇴") return { error: "확인 칸에 '탈퇴'라고 적어주세요." };

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
  if (error) return { error: "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요." };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?bye=1");
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "두 비밀번호가 달라요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.toLowerCase().includes("different from the old")) return { error: "지금 비밀번호와 다른 걸로 정해주세요." };
    if (error.message.toLowerCase().includes("session")) return { error: "링크가 만료됐어요. 비밀번호 찾기를 다시 해주세요." };
    return { error: "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  return { message: "비밀번호를 바꿨어요. 다음부터 새 비밀번호로 로그인하세요." };
}
