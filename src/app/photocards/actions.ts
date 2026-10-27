"use server";

import { revalidatePath } from "next/cache";
import { PROOF_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// 인증 사진 올리기·신청은 사진 업로드 때문에 브라우저에서 합니다 (components/ProofForm.tsx)

/** 확인 중인 내 인증 취소 (보안 규칙상 본인 것만 지워짐) */
export async function cancelProof(formData: FormData) {
  const id = Number(formData.get("id"));
  const cardId = Number(formData.get("cardId"));
  const supabase = await createClient();
  const { data } = await supabase
    .from("photocard_collections")
    .delete()
    .eq("id", id)
    .eq("status", "pending")
    .select("photo_path")
    .maybeSingle();
  if (data?.photo_path) await supabase.storage.from(PROOF_BUCKET).remove([data.photo_path]);
  revalidatePath(`/photocards/${cardId}`);
  revalidatePath("/photocards");
}
