"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pokedexMembers } from "@/data/members";
import { pokedexSources } from "@/data/pokedex-sets";
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
    const source = String(form.get("source") ?? "").trim() || "앨범";
    const member = String(form.get("member") ?? "");
    const sourceUrl = String(form.get("source_url") ?? "").trim();
    setError(undefined);
    setMessage(undefined);
    if (!album || !member) return setError("앨범과 멤버를 골라주세요.");

    setPending(true);
    const supabase = createClient();
    // 이미지는 없어도 됨 (나중에 올리거나, 회원 인증 사진으로 채움)
    let path: string | null = null;
    if (file instanceof File && file.size > 0) {
      const image = await shrinkImage(file, 1000, 0.9);
      path = storagePath("cards", image);
      const { error: uploadError } = await supabase.storage.from(CATALOG_BUCKET).upload(path, image, { contentType: image.type });
      if (uploadError) {
        setPending(false);
        return setError(`이미지를 올리지 못했어요: ${uploadError.message}`);
      }
    }
    const { error: insertError } = await supabase.from("photocard_catalog").insert({
      source,
      album,
      member,
      label: String(form.get("label") ?? "").trim(),
      sort: Number(form.get("sort")) || 0,
      image_path: path,
      source_url: sourceUrl || null,
    });
    setPending(false);
    if (insertError) {
      if (path) await supabase.storage.from(CATALOG_BUCKET).remove([path]);
      return setError(
        insertError.code === "23505" ? "이미 같은 카드(출처·세트·멤버·구분)가 있어요." : `등록하지 못했어요: ${insertError.message}`,
      );
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
        <span className="text-sm font-semibold">출처 (도감 탭)</span>
        <input name="source" list="source-options" required maxLength={30} defaultValue="앨범" className={inputClass} />
        <datalist id="source-options">
          {pokedexSources.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold">세트 이름 (앨범·이벤트)</span>
        <input name="album" list="album-options" required maxLength={60} className={inputClass} placeholder="예: PULSE, CU 리센느빵 2탄" />
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
      <label className="space-y-1">
        <span className="text-sm font-semibold">출처 링크 (선택 · 공식 공지·기사)</span>
        <input name="source_url" type="url" maxLength={500} className={inputClass} placeholder="https://…" />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="text-sm font-semibold">카드 이미지 (선택 · 없으면 나중에 회원 인증 사진으로 채울 수 있어요)</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
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
