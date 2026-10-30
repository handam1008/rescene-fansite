"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { members } from "@/data/members";
import { getI18n } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

/** 내 롤링페이퍼 만들기 (이미 있으면 그대로) → 내 페이지로 */
export async function createPaper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cheer");

  const { data: existing } = await supabase.from("cheer_papers").select("id").eq("owner_id", user.id).maybeSingle();
  if (existing) redirect(`/cheer/${existing.id}`);

  const { data, error } = await supabase.from("cheer_papers").insert({ owner_id: user.id }).select("id").single();
  if (error || !data) {
    // 동시에 두 번 눌러서 이미 만들어졌으면 그걸로
    const { data: again } = await supabase.from("cheer_papers").select("id").eq("owner_id", user.id).maybeSingle();
    if (again) redirect(`/cheer/${again.id}`);
    redirect("/cheer?error=1");
  }
  revalidatePath("/cheer");
  redirect(`/cheer/${data.id}`);
}

export async function addCheer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { m } = await getI18n();
  const paperId = String(formData.get("paperId") ?? "");
  const member = String(formData.get("member") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!content || content.length > 100) return { error: m.cheer.errContent };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cheer/${paperId}`);

  const { error } = await supabase.from("cheer_messages").insert({
    paper_id: paperId,
    member: members.some((x) => x.slug === member) ? member : null,
    content,
  });
  // 42501: 하루 30개를 넘었거나 이용 제한 중 (DB 규칙)
  if (error) return { error: error.code === "42501" ? m.cheer.errLimit : m.cheer.errSave };

  revalidatePath(`/cheer/${paperId}`);
  revalidatePath("/cheer");
  return { message: "ok" };
}

/** 응원 떼기: 쓴 사람·페이지 주인·운영자만 (DB 규칙이 막음) */
export async function deleteCheer(formData: FormData) {
  const supabase = await createClient();
  const paperId = String(formData.get("paperId") ?? "");
  await supabase.from("cheer_messages").delete().eq("id", Number(formData.get("id")));
  revalidatePath(`/cheer/${paperId}`);
  revalidatePath("/cheer");
}
