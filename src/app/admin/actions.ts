"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sharePath } from "@/lib/image";
import { CATALOG_BUCKET, POST_IMAGE_BUCKET, PROOF_BUCKET } from "@/lib/supabase/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// 관리자 기능. 화면에서도 확인하지만, 실제로 막는 건 DB 보안 규칙(public.is_admin())입니다.

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("관리자만 할 수 있어요.");
}

/**
 * 승인. 회원이 공개에 동의했으면:
 * - 도감 이미지가 빈 카드는 자동으로 이 사진으로 채우고 첫 제공자로 기록 (skipImage=1 이면 승인만)
 * - 이미 이미지가 있는 카드는 useAsImage=1 일 때만 사진 교체 (첫 제공자는 그대로)
 */
export async function approveProof(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("photocard_collections")
    .update({ status: "approved", reject_reason: null, reviewed_at: new Date().toISOString() })
    .eq("id", Number(formData.get("id")))
    .select("card_id, user_id, photo_path, share_image")
    .maybeSingle();

  if (entry?.share_image && formData.get("skipImage") !== "1") {
    const { data: card } = await supabase
      .from("photocard_catalog")
      .select("image_path, first_contributor")
      .eq("id", entry.card_id)
      .maybeSingle();
    const replace = formData.get("useAsImage") === "1";
    if (card && (!card.image_path || replace)) {
      // 공개 동의 때 함께 올린 작은 사본을 씀 (원본 화질은 공개하지 않음)
      const dest = `cards/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from(PROOF_BUCKET)
        .copy(sharePath(entry.photo_path), dest, { destinationBucket: CATALOG_BUCKET });
      if (!error) {
        const first = card.first_contributor ? {} : { first_contributor: entry.user_id, filled_at: new Date().toISOString() };
        await supabase
          .from("photocard_catalog")
          .update({ image_path: dest, image_contributor: entry.user_id, ...first })
          .eq("id", entry.card_id);
        if (card.image_path) await supabase.storage.from(CATALOG_BUCKET).remove([card.image_path]);
      }
    }
  }
  revalidatePath("/admin");
  revalidatePath("/photocards");
  revalidatePath("/");
}

export async function rejectProof(formData: FormData) {
  await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200) || "사진으로 확인이 어려워요. 카드가 잘 보이게 다시 찍어주세요.";
  const supabase = await createClient();
  await supabase
    .from("photocard_collections")
    .update({ status: "rejected", reject_reason: reason, reviewed_at: new Date().toISOString() })
    .eq("id", Number(formData.get("id")));
  revalidatePath("/admin");
}

export async function deleteCatalogCard(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("photocard_catalog")
    .delete()
    .eq("id", Number(formData.get("id")))
    .select("image_path")
    .maybeSingle();
  if (data?.image_path) await supabase.storage.from(CATALOG_BUCKET).remove([data.image_path]);
  revalidatePath("/admin");
  revalidatePath("/photocards");
}

/** 세트 전체(같은 출처·세트 이름) 카드의 출처 링크 바꾸기. 비우면 링크 없앰 */
export async function updateSetSourceUrl(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get("url") ?? "").trim();
  if (url && !/^https?:\/\//.test(url)) throw new Error("링크는 http:// 또는 https:// 로 시작해야 해요.");
  const supabase = await createClient();
  await supabase
    .from("photocard_catalog")
    .update({ source_url: url || null })
    .eq("source", String(formData.get("source") ?? "앨범"))
    .eq("album", String(formData.get("album") ?? ""));
  revalidatePath("/admin");
  revalidatePath("/photocards");
}

/* ───────── 게시판 관리: 신고·숨김 글 ───────── */

function revalidateBoard(postId: number) {
  revalidatePath("/admin");
  revalidatePath("/board");
  revalidatePath(`/board/${postId}`);
  revalidatePath("/");
}

/** 운영자가 직접 숨김 */
export async function hidePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").update({ hidden_at: new Date().toISOString(), hidden_reason: "admin" }).eq("id", id);
  revalidateBoard(id);
}

/** 복구: 다시 보이게 하고, 이후로는 자동 숨김에서 제외 */
export async function restorePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("posts")
    .update({ hidden_at: null, hidden_reason: null, restored_at: new Date().toISOString() })
    .eq("id", id);
  revalidateBoard(id);
}

/** 신고 기록만 지우기 (문제없는 글) */
export async function clearReports(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("post_reports").delete().eq("post_id", id);
  revalidateBoard(id);
}

/** 완전히 삭제 (사진 파일도 함께). back 이 있으면 그 목록으로 이동 */
export async function adminDeletePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  const { data } = await supabase.from("posts").delete().eq("id", id).select("image_paths").maybeSingle();
  const imagePaths: string[] = data?.image_paths ?? [];
  if (imagePaths.length > 0) await supabase.storage.from(POST_IMAGE_BUCKET).remove(imagePaths);
  revalidateBoard(id);
  const back = String(formData.get("back") ?? "");
  if (back.startsWith("/")) redirect(back);
}
