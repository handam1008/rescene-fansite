"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { shrinkImage, storagePath } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { CATALOG_BUCKET } from "@/lib/supabase/env";

/** 관리자: 도감 카드 하나에 이미지 올리기·바꾸기 */
export default function CatalogImageButton({ cardId, current }: { cardId: number; current: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  async function upload(file: File | undefined) {
    if (!file) return;
    setState("busy");
    const supabase = createClient();
    const image = await shrinkImage(file, 1000, 0.9);
    const path = storagePath("cards", image);
    const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, image, { contentType: image.type });
    if (error) return setState("error");
    const { error: updateError } = await supabase.from("photocard_catalog").update({ image_path: path }).eq("id", cardId);
    if (updateError) {
      await supabase.storage.from(CATALOG_BUCKET).remove([path]);
      return setState("error");
    }
    if (current) await supabase.storage.from(CATALOG_BUCKET).remove([current]);
    setState("idle");
    router.refresh();
  }

  return (
    <label className="cursor-pointer text-ink-soft underline hover:text-ink">
      {state === "busy" ? "올리는 중…" : state === "error" ? "실패, 다시" : current ? "이미지 바꾸기" : "이미지 올리기"}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={state === "busy"}
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </label>
  );
}
