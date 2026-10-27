"use server";

import { revalidatePath } from "next/cache";
import { CATALOG_BUCKET } from "@/lib/supabase/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// 관리자 기능. 화면에서도 확인하지만, 실제로 막는 건 DB 보안 규칙(public.is_admin())입니다.

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("관리자만 할 수 있어요.");
}

export async function approveProof(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("photocard_collections")
    .update({ status: "approved", reject_reason: null, reviewed_at: new Date().toISOString() })
    .eq("id", Number(formData.get("id")));
  revalidatePath("/admin");
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
