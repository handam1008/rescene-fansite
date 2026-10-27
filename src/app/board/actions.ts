"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { reportReasons } from "@/data/moderation";
import { POST_IMAGE_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// 글 작성은 사진 업로드 때문에 브라우저에서 바로 저장합니다 (components/BoardForms.tsx)

export async function deletePost(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();

  // RLS 덕분에 본인 글만 지워집니다. 지워진 글의 사진 파일도 함께 삭제
  const { data } = await supabase.from("posts").delete().eq("id", id).select("*").maybeSingle();
  const imagePaths: string[] = data?.image_paths ?? [];
  if (imagePaths.length > 0) {
    await supabase.storage.from(POST_IMAGE_BUCKET).remove(imagePaths);
  }

  revalidatePath("/board");
  redirect("/board");
}

export async function addComment(_prev: FormState, formData: FormData): Promise<FormState> {
  const postId = Number(formData.get("postId"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content || content.length > 1000) return { error: "댓글은 1~1000자로 적어주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({ post_id: postId, content });
  if (error) return { error: "댓글을 저장하지 못했어요. 로그인 상태를 확인해 주세요." };

  revalidatePath(`/board/${postId}`);
  return { message: "" };
}

export async function deleteComment(formData: FormData) {
  const id = Number(formData.get("id"));
  const postId = Number(formData.get("postId"));
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", id);
  revalidatePath(`/board/${postId}`);
}

/** 추천(1)·비추천(-1). 같은 걸 다시 누르면 취소, 반대를 누르면 바꿈. 본인 글·숨긴 글은 DB 규칙이 막음 */
export async function votePost(formData: FormData) {
  const postId = Number(formData.get("postId"));
  const value = Number(formData.get("value")) === -1 ? -1 : 1;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/board/${postId}`);

  const { data: existing } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) await supabase.from("post_votes").insert({ post_id: postId, value });
  else if (existing.value === value) await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", user.id);
  else await supabase.from("post_votes").update({ value }).eq("post_id", postId).eq("user_id", user.id);

  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");
}

export async function reportPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const postId = Number(formData.get("postId"));
  const reason = String(formData.get("reason") ?? "");
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 200);
  if (!(reason in reportReasons)) return { error: "신고 사유를 골라주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("post_reports").insert({ post_id: postId, reason, detail: detail || null });
  if (error) {
    return { error: error.code === "23505" ? "이미 신고한 글이에요." : "신고하지 못했어요. 로그인 상태를 확인해 주세요." };
  }
  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");
  return { message: "신고했어요. 운영자가 확인할게요." };
}
