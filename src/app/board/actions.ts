"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { reportReasons } from "@/data/moderation";
import { getI18n } from "@/i18n/server";
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
  const { m } = await getI18n();
  if (!content || content.length > 1000) return { error: m.board.errComment };

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({ post_id: postId, content });
  if (error) return { error: m.board.errCommentSave };

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

/** 추천(1)·비추천(-1). 한 사람당 한 번, 누른 뒤에는 바꾸거나 취소할 수 없음. 본인 글·숨긴 글·이용 제한은 DB 규칙이 막음 */
export async function votePost(formData: FormData) {
  const postId = Number(formData.get("postId"));
  const value = Number(formData.get("value")) === -1 ? -1 : 1;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/board/${postId}`);

  // 이미 누른 글이면 DB 의 unique 규칙에 걸려 그냥 무시됨
  await supabase.from("post_votes").insert({ post_id: postId, value });

  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");
}

export async function reportPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const postId = Number(formData.get("postId"));
  const reason = String(formData.get("reason") ?? "");
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 200);
  const { m } = await getI18n();
  if (!(reason in reportReasons)) return { error: m.board.errReasonPick };

  const supabase = await createClient();
  const { error } = await supabase.from("post_reports").insert({ post_id: postId, reason, detail: detail || null });
  if (error) {
    return { error: error.code === "23505" ? m.board.errAlreadyReported : m.board.errReport };
  }
  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");
  return { message: m.board.reportedOk };
}
