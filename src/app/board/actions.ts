"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
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
