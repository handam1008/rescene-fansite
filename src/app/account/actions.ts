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
  if (/^user_/i.test(nickname)) return { error: "user_ 로 시작하는 닉네임은 쓸 수 없어요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

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
