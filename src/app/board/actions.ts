"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || title.length > 100) return { error: "제목은 1~100자로 적어주세요." };
  if (!content || content.length > 5000) return { error: "내용은 1~5000자로 적어주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content })
    .select("id")
    .single();
  if (error) return { error: "글을 저장하지 못했어요. 로그인 상태를 확인해 주세요." };

  revalidatePath("/board");
  redirect(`/board/${data.id}`);
}

export async function deletePost(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
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
