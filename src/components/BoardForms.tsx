"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/auth/actions";
import { addComment } from "@/app/board/actions";
import { members } from "@/data/members";
import { shrinkImage, storagePath } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { POST_IMAGE_BUCKET } from "@/lib/supabase/env";
import { buttonClass, FormMessage, inputClass } from "./ui";

const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 글쓰기 폼.
 * 사진은 서버를 거치지 않고 브라우저에서 Supabase Storage로 바로 올린 뒤 글을 저장합니다.
 * (Vercel 서버 요청 용량 제한을 피하기 위해. 본인 글만 쓸 수 있는 건 DB 보안 규칙이 지킵니다)
 */
export function PostForm({ userId, defaultMember = "" }: { userId: string; defaultMember?: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  async function addFiles(list: FileList | null) {
    setError(undefined);
    const picked = Array.from(list ?? []);
    if (picked.some((f) => !ACCEPT.includes(f.type))) return setError("사진은 JPG·PNG·WEBP·GIF만 올릴 수 있어요.");
    // 휴대폰 사진은 크기를 줄여서 올림 (GIF는 그대로)
    const shrunk = await Promise.all(picked.map((f) => shrinkImage(f)));
    if (shrunk.some((f) => f.size > MAX_BYTES)) return setError("사진 한 장은 5MB 이하여야 해요. (GIF는 줄일 수 없어요)");
    const next = [...files, ...shrunk];
    if (next.length > MAX_IMAGES) setError(`사진은 최대 ${MAX_IMAGES}장까지예요.`);
    setFiles(next.slice(0, MAX_IMAGES));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const content = String(form.get("content") ?? "").trim();
    const member = String(form.get("member") ?? "");
    setError(undefined);
    if (!title || title.length > 100) return setError("제목은 1~100자로 적어주세요.");
    if (!content || content.length > 5000) return setError("내용은 1~5000자로 적어주세요.");

    setPending(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of files) {
      const path = storagePath(userId, file);
      const { error: uploadError } = await supabase.storage
        .from(POST_IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        if (uploaded.length) await supabase.storage.from(POST_IMAGE_BUCKET).remove(uploaded);
        setPending(false);
        return setError(`사진을 올리지 못했어요: ${uploadError.message}`);
      }
      uploaded.push(path);
    }

    // 새 칸(사진·멤버)은 값이 있을 때만 보냄
    const row: Record<string, unknown> = { title, content };
    if (uploaded.length) row.image_paths = uploaded;
    if (member) row.member = member;
    const { data, error: insertError } = await supabase.from("posts").insert(row).select("id").single();
    if (insertError) {
      if (uploaded.length) await supabase.storage.from(POST_IMAGE_BUCKET).remove(uploaded);
      setPending(false);
      return setError("글을 저장하지 못했어요. 로그인 상태를 확인해 주세요.");
    }

    router.push(`/board/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-lilac-200 bg-white">
      <div className="border-b border-lilac-200 bg-lilac-50 px-4 py-2.5 text-sm font-bold">글쓰기</div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <select
            name="member"
            defaultValue={defaultMember}
            aria-label="게시판 선택"
            // inputClass 의 w-full 과 겹치지 않게 너비를 따로 지정 (겹치면 제목 칸이 밀려 사라짐)
            className="w-28 shrink-0 border border-lilac-200 bg-white px-2 py-2 text-sm outline-none focus:border-lilac-500"
          >
            <option value="">전체</option>
            {members.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            name="title"
            required
            maxLength={100}
            className={`${inputClass} min-w-0 flex-1`}
            placeholder="제목을 입력해 주세요"
          />
        </div>
        <textarea
          name="content"
          required
          maxLength={5000}
          rows={14}
          className={`${inputClass} leading-relaxed`}
          placeholder="내용을 입력해 주세요"
        />

        <div className="border border-dashed border-lilac-300 bg-lilac-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              사진 첨부 <span className="font-normal text-ink-soft">({files.length}/{MAX_IMAGES}, 한 장 5MB 이하)</span>
            </span>
            <label
              className={`cursor-pointer border border-lilac-300 bg-white px-3 py-1 text-sm font-semibold hover:bg-lilac-100 ${
                files.length >= MAX_IMAGES ? "pointer-events-none opacity-40" : ""
              }`}
            >
              + 사진 선택
              <input
                type="file"
                accept={ACCEPT.join(",")}
                multiple
                className="sr-only"
                disabled={files.length >= MAX_IMAGES}
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <li key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기 */}
                  <img src={src} alt={`첨부 사진 ${i + 1}`} className="aspect-square w-full border border-lilac-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-ink/70 px-1.5 text-xs text-white hover:bg-ink"
                    aria-label={`사진 ${i + 1} 빼기`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FormMessage error={error} />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="border border-lilac-200 bg-white px-4 py-2 text-sm hover:bg-lilac-50">
            취소
          </button>
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? (files.length ? "사진 올리는 중…" : "등록 중…") : "등록"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function CommentForm({ postId }: { postId: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addComment, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // 댓글이 등록되면 입력창 비우기
  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <div className="flex gap-2">
        <textarea
          name="content"
          required
          maxLength={1000}
          rows={3}
          className={`${inputClass} flex-1`}
          placeholder="타인의 권리를 침해하거나 명예를 훼손하는 댓글은 삭제될 수 있어요."
        />
        <button type="submit" disabled={pending} className={`${buttonClass} w-20 shrink-0`}>
          {pending ? "…" : "등록"}
        </button>
      </div>
      <FormMessage error={state?.error} />
    </form>
  );
}
