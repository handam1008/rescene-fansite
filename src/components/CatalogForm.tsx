"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pokedexMembers } from "@/data/members";
import { shrinkImage, storagePath } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { CATALOG_BUCKET } from "@/lib/supabase/env";
import { buttonClass, FormMessage, inputClass } from "./ui";

/** 관리자: 도감에 공식 포토카드 등록 */
export default function CatalogForm({ albums }: { albums: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const file = form.get("image");
    const album = String(form.get("album") ?? "").trim();
    const member = String(form.get("member") ?? "");
    setError(undefined);
    setMessage(undefined);
    if (!album || !member) return setError("앨범과 멤버를 골라주세요.");
    if (!(file instanceof File) || file.size === 0) return setError("카드 이미지를 골라주세요.");

    setPending(true);
    const supabase = createClient();
    const image = await shrinkImage(file, 1000, 0.9);
    const path = storagePath("cards", image);
    const { error: uploadError } = await supabase.storage.from(CATALOG_BUCKET).upload(path, image, { contentType: image.type });
    if (uploadError) {
      setPending(false);
      return setError(`이미지를 올리지 못했어요: ${uploadError.message}`);
    }
    const { error: insertError } = await supabase.from("photocard_catalog").insert({
      album,
      member,
      label: String(form.get("label") ?? "").trim(),
      sort: Number(form.get("sort")) || 0,
      image_path: path,
    });
    setPending(false);
    if (insertError) {
      await supabase.storage.from(CATALOG_BUCKET).remove([path]);
      return setError(`등록하지 못했어요: ${insertError.message}`);
    }
    setMessage(`등록했어요: ${album} · ${pokedexMembers.find((m) => m.slug === member)?.name}`);
    // 앨범은 그대로 두고 다음 카드를 바로 등록할 수 있게
    (formEl.elements.namedItem("label") as HTMLInputElement).value = "";
    (formEl.elements.namedItem("image") as HTMLInputElement).value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm font-semibold">앨범</span>
        <input name="album" list="album-options" required maxLength={60} className={inputClass} placeholder="예: PULSE" />
        <datalist id="album-options">
          {albums.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold">멤버</span>
        <select name="member" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            선택
          </option>
          {pokedexMembers.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold">구분 (선택)</span>
        <input name="label" maxLength={60} className={inputClass} placeholder="예: 앨범 포카 A, 미공포 · OO샵" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold">정렬 순서 (작을수록 앞)</span>
        <input name="sort" type="number" defaultValue={0} className={inputClass} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="text-sm font-semibold">카드 이미지 (앞면 스캔·사진)</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="block w-full text-sm" />
      </label>
      <div className="space-y-2 sm:col-span-2">
        <FormMessage error={error} message={message} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "등록 중…" : "도감에 등록"}
        </button>
      </div>
    </form>
  );
}
