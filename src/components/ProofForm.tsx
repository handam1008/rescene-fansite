"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { useEffect, useState } from "react";
import { sharePath, shrinkImage, storagePath } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { PROOF_BUCKET } from "@/lib/supabase/env";
import { buttonClass, FormMessage } from "./ui";

/**
 * 실물 포카 인증 폼. 휴대폰에서는 바로 카메라가 열립니다.
 * 사진은 비공개 저장소(본인·관리자만 볼 수 있음)에 올라가고, 관리자가 확인하면 도감에 채워집니다.
 * 공개에 동의하면 작게 줄인 사본(-share)도 함께 올려, 승인 때 그 사본이 도감 이미지로 쓰입니다.
 */
export default function ProofForm({
  userId,
  cardId,
  previous,
  cardHasImage,
}: {
  userId: string;
  cardId: number;
  /** 이미 도감 이미지가 있는 카드면 공개 동의 안내를 다르게 */
  cardHasImage: boolean;
  /** 거절된 이전 인증이 있으면 지우고 다시 신청 */
  previous?: { id: number; photo_path: string };
}) {
  const router = useRouter();
  const { m } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [share, setShare] = useState(false);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit() {
    if (!file) return setError(m.pokedex.errNoFile);
    setError(undefined);
    setPending(true);
    const supabase = createClient();

    const photo = await shrinkImage(file, 1280);
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      setPending(false);
      return setError(m.pokedex.errType);
    }
    const path = storagePath(userId, photo);
    const { error: uploadError } = await supabase.storage.from(PROOF_BUCKET).upload(path, photo, { contentType: photo.type });
    if (uploadError) {
      setPending(false);
      return setError(fmt(m.pokedex.errUpload, { msg: uploadError.message }));
    }
    // 도감 공개용 사본: 원본 화질은 공개하지 않도록 작게
    if (share) {
      const small = await shrinkImage(file, 600, 0.8);
      const { error: shareError } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(sharePath(path), small, { contentType: "image/jpeg" });
      if (shareError) {
        await supabase.storage.from(PROOF_BUCKET).remove([path]);
        setPending(false);
        return setError(fmt(m.pokedex.errUpload, { msg: shareError.message }));
      }
    }

    if (previous) {
      await supabase.from("photocard_collections").delete().eq("id", previous.id);
      await supabase.storage.from(PROOF_BUCKET).remove([previous.photo_path, sharePath(previous.photo_path)]);
    }

    const { error: insertError } = await supabase
      .from("photocard_collections")
      .insert({ card_id: cardId, photo_path: path, share_image: share });
    if (insertError) {
      await supabase.storage.from(PROOF_BUCKET).remove([path, sharePath(path)]);
      setPending(false);
      return setError(m.pokedex.errSubmit);
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-lilac-300 bg-lilac-50 p-5 text-center hover:bg-lilac-100">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기
          <img src={preview} alt={m.pokedex.previewAlt} className="max-h-64 w-auto" />
        ) : (
          <>
            <span className="text-3xl" aria-hidden>📷</span>
            <span className="text-sm font-semibold">{m.pokedex.takePhoto}</span>
            <span className="text-xs text-ink-soft">{m.pokedex.takePhotoHint}</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label className="flex items-start gap-2 text-xs leading-relaxed">
        <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-0.5" />
        <span>
          <b>{m.pokedex.consent}</b> {cardHasImage ? m.pokedex.consentReplace : m.pokedex.consentFirst}
          <span className="block text-ink-soft">{m.pokedex.consentOptional}</span>
        </span>
      </label>
      <FormMessage error={error} />
      <button type="button" onClick={submit} disabled={pending || !file} className={`${buttonClass} w-full`}>
        {pending ? m.pokedex.uploading : previous ? m.pokedex.resubmit : m.pokedex.submit}
      </button>
    </div>
  );
}
