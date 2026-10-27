"use server";

import { revalidatePath } from "next/cache";
import { CATALOG_BUCKET, PROOF_BUCKET } from "@/lib/supabase/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// 관리자 기능. 화면에서도 확인하지만, 실제로 막는 건 DB 보안 규칙(public.is_admin())입니다.

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("관리자만 할 수 있어요.");
}

/** 승인. useAsImage=1 이면 이 인증 사진을 도감 카드 이미지로도 씀 (이미지 없는 카드 채우기) */
export async function approveProof(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("photocard_collections")
    .update({ status: "approved", reject_reason: null, reviewed_at: new Date().toISOString() })
    .eq("id", Number(formData.get("id")))
    .select("card_id, photo_path")
    .maybeSingle();

  if (entry && formData.get("useAsImage") === "1") {
    const ext = entry.photo_path.split(".").pop() || "jpg";
    const dest = `cards/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(PROOF_BUCKET)
      .copy(entry.photo_path, dest, { destinationBucket: CATALOG_BUCKET });
    if (!error) {
      const { data: card } = await supabase.from("photocard_catalog").select("image_path").eq("id", entry.card_id).maybeSingle();
      await supabase.from("photocard_catalog").update({ image_path: dest }).eq("id", entry.card_id);
      if (card?.image_path) await supabase.storage.from(CATALOG_BUCKET).remove([card.image_path]);
    }
  }
  revalidatePath("/admin");
  revalidatePath("/photocards");
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
