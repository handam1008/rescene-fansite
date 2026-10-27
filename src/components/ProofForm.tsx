"use client";

import { useRouter } from "next/navigation";
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
    if (!file) return setError("카드 사진을 찍어주세요.");
    setError(undefined);
    setPending(true);
    const supabase = createClient();

    const photo = await shrinkImage(file, 1280);
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      setPending(false);
      return setError("JPG·PNG·WEBP 사진만 올릴 수 있어요.");
    }
    const path = storagePath(userId, photo);
    const { error: uploadError } = await supabase.storage.from(PROOF_BUCKET).upload(path, photo, { contentType: photo.type });
    if (uploadError) {
      setPending(false);
      return setError(`사진을 올리지 못했어요: ${uploadError.message}`);
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
        return setError(`사진을 올리지 못했어요: ${shareError.message}`);
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
      return setError("인증을 신청하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-lilac-300 bg-lilac-50 p-5 text-center hover:bg-lilac-100">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기
          <img src={preview} alt="찍은 카드 사진" className="max-h-64 w-auto" />
        ) : (
          <>
            <span className="text-3xl" aria-hidden>📷</span>
            <span className="text-sm font-semibold">실물 카드 찍기</span>
            <span className="text-xs text-ink-soft">카드 앞면 전체가 잘 보이게 직접 찍어주세요 (인터넷에서 받은 사진은 반려돼요)</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label className="flex items-start gap-2 text-xs leading-relaxed">
        <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-0.5" />
        <span>
          <b>도감 이미지로 공개하는 데 동의해요.</b>{" "}
          {cardHasImage
            ? "더 잘 나온 사진이면 운영자가 도감 이미지를 이 사진으로 바꿀 수 있어요."
            : "승인되면 이 사진(작게 줄인 사본)이 도감 이미지가 되고, 첫 제공자로 닉네임이 남아요."}
          <span className="block text-ink-soft">동의하지 않아도 내 수집 인증은 똑같이 돼요.</span>
        </span>
      </label>
      <FormMessage error={error} />
      <button type="button" onClick={submit} disabled={pending || !file} className={`${buttonClass} w-full`}>
        {pending ? "올리는 중…" : previous ? "다시 인증 신청" : "인증 신청"}
      </button>
    </div>
  );
}
