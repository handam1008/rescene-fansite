"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { photocardMembers } from "@/data/members";
import { createClient } from "@/lib/supabase/client";
import { PHOTOCARD_BUCKET } from "@/lib/supabase/env";
import { buttonClass, FormMessage, inputClass } from "./ui";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 포카 업로드 폼.
 * 이미지는 서버를 거치지 않고 브라우저에서 Supabase Storage로 바로 올립니다.
 * (Vercel 서버 요청 용량 제한을 피하기 위해)
 */
export default function PhotocardForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(undefined);

    if (!file) return setError("사진을 골라주세요.");
    if (!ACCEPT.includes(file.type)) return setError("JPG, PNG, WEBP, GIF 사진만 올릴 수 있어요.");
    if (file.size > MAX_BYTES) return setError("사진은 5MB 이하만 올릴 수 있어요.");

    setPending(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTOCARD_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      setPending(false);
      return setError(`사진을 올리지 못했어요: ${uploadError.message}`);
    }

    const { error: insertError } = await supabase.from("photocards").insert({
      member: String(form.get("member")),
      album: String(form.get("album") ?? "").trim() || null,
      description: String(form.get("description") ?? "").trim() || null,
      image_path: path,
    });
    if (insertError) {
      await supabase.storage.from(PHOTOCARD_BUCKET).remove([path]);
      setPending(false);
      return setError(`저장하지 못했어요: ${insertError.message}`);
    }

    router.push("/photocards");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">사진 (5MB 이하)</span>
        <input
          type="file"
          accept={ACCEPT.join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:border file:border-lilac-300 file:bg-lilac-100 file:px-3 file:py-1.5 file:text-sm"
        />
      </label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기
        <img src={preview} alt="미리보기" className="mx-auto aspect-[55/85] w-40 border border-lilac-200 object-cover" />
      )}

      <label className="block space-y-1">
        <span className="text-sm font-semibold">멤버</span>
        <select name="member" required className={inputClass} defaultValue="">
          <option value="" disabled>
            선택해 주세요
          </option>
          {photocardMembers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">앨범·출처 (선택)</span>
        <input name="album" maxLength={50} className={inputClass} placeholder="예: lip bomb 앨범 포카" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">한마디 (선택)</span>
        <textarea name="description" maxLength={300} rows={3} className={inputClass} />
      </label>

      <FormMessage error={error} />

      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "올리는 중…" : "올리기"}
      </button>
    </form>
  );
}
