"use server";

import { revalidatePath } from "next/cache";
import { PHOTOCARD_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function deletePhotocard(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();

  // RLS 덕분에 본인 포카만 지워집니다. 지워진 행의 이미지 경로로 파일도 삭제
  const { data } = await supabase
    .from("photocards")
    .delete()
    .eq("id", id)
    .select("image_path")
    .maybeSingle();
  if (data?.image_path) {
    await supabase.storage.from(PHOTOCARD_BUCKET).remove([data.image_path]);
  }

  revalidatePath("/photocards");
}
