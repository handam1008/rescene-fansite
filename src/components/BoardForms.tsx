"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/auth/actions";
import { addComment } from "@/app/board/actions";
import { members, nameOf } from "@/data/members";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { shrinkImage, storagePath } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { POST_IMAGE_BUCKET } from "@/lib/supabase/env";
import { postImageUrl } from "@/lib/storage-url";
import { buttonClass, FormMessage, inputClass } from "./ui";

const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** 수정할 때 폼에 채워 넣는 원래 글 */
export type EditablePost = { id: number; title: string; content: string; member: string | null; image_paths: string[] };

/**
 * 글쓰기·글 수정 폼.
 * 사진은 서버를 거치지 않고 브라우저에서 Supabase Storage로 바로 올린 뒤 글을 저장합니다.
 * (Vercel 서버 요청 용량 제한을 피하기 위해. 본인 글만 쓸 수 있는 건 DB 보안 규칙이 지킵니다)
 * editing 이 있으면 수정: 기존 사진은 빼거나 남기고, 새 사진을 더할 수 있음. 뺀 사진 파일은 저장 후 지움.
 */
export function PostForm({
  userId,
  defaultMember = "",
  editing,
}: {
  userId: string;
  defaultMember?: string;
  editing?: EditablePost;
}) {
  const router = useRouter();
  const { locale, m } = useI18n();
  const [kept, setKept] = useState<string[]>(editing?.image_paths ?? []);
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
    if (picked.some((f) => !ACCEPT.includes(f.type))) return setError(m.board.errImgType);
    // 휴대폰 사진은 크기를 줄여서 올림 (GIF는 그대로)
    const shrunk = await Promise.all(picked.map((f) => shrinkImage(f)));
    if (shrunk.some((f) => f.size > MAX_BYTES)) return setError(m.board.errImgSize);
    const next = [...files, ...shrunk];
    const room = MAX_IMAGES - kept.length;
    if (next.length > room) setError(fmt(m.board.errImgMax, { n: MAX_IMAGES }));
    setFiles(next.slice(0, room));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const content = String(form.get("content") ?? "").trim();
    const member = String(form.get("member") ?? "");
    setError(undefined);
    if (!title || title.length > 100) return setError(m.board.errTitle);
    if (!content || content.length > 5000) return setError(m.board.errContent);

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
        return setError(fmt(m.board.errUpload, { msg: uploadError.message }));
      }
      uploaded.push(path);
    }

    if (editing) {
      const { error: updateError } = await supabase
        .from("posts")
        .update({ title, content, member: member || null, image_paths: [...kept, ...uploaded] })
        .eq("id", editing.id);
      if (updateError) {
        if (uploaded.length) await supabase.storage.from(POST_IMAGE_BUCKET).remove(uploaded);
        setPending(false);
        return setError(m.board.errEdit);
      }
      const removed = editing.image_paths.filter((p) => !kept.includes(p));
      if (removed.length) await supabase.storage.from(POST_IMAGE_BUCKET).remove(removed);
      router.push(`/board/${editing.id}`);
      router.refresh();
      return;
    }

    // 새 칸(사진·멤버)은 값이 있을 때만 보냄
    const row: Record<string, unknown> = { title, content };
    if (uploaded.length) row.image_paths = uploaded;
    if (member) row.member = member;
    const { data, error: insertError } = await supabase.from("posts").insert(row).select("id").single();
    if (insertError) {
      if (uploaded.length) await supabase.storage.from(POST_IMAGE_BUCKET).remove(uploaded);
      setPending(false);
      return setError(m.board.errSave);
    }

    router.push(`/board/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-lilac-200 bg-white">
      <div className="border-b border-lilac-200 bg-lilac-50 px-4 py-2.5 text-sm font-bold">{editing ? m.board.editPost : m.board.writePost}</div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <select
            name="member"
            defaultValue={editing ? (editing.member ?? "") : defaultMember}
            aria-label={m.board.boardSelect}
            // inputClass 의 w-full 과 겹치지 않게 너비를 따로 지정 (겹치면 제목 칸이 밀려 사라짐)
            className="w-28 shrink-0 border border-lilac-200 bg-white px-2 py-2 text-sm outline-none focus:border-lilac-500"
          >
            <option value="">{m.board.boardAll}</option>
            {members.map((member) => (
              <option key={member.slug} value={member.slug}>
                {nameOf(member, locale)}
              </option>
            ))}
          </select>
          <input
            name="title"
            required
            maxLength={100}
            defaultValue={editing?.title}
            className={`${inputClass} min-w-0 flex-1`}
            placeholder={m.board.titlePlaceholder}
          />
        </div>
        <textarea
          name="content"
          required
          maxLength={5000}
          rows={14}
          defaultValue={editing?.content}
          className={`${inputClass} leading-relaxed`}
          placeholder={m.board.contentPlaceholder}
        />

        <div className="border border-dashed border-lilac-300 bg-lilac-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              {m.board.attach}{" "}
              <span className="font-normal text-ink-soft">
                {fmt(m.board.attachInfo, { n: kept.length + files.length, max: MAX_IMAGES })}
              </span>
            </span>
            <label
              className={`cursor-pointer border border-lilac-300 bg-white px-3 py-1 text-sm font-semibold hover:bg-lilac-100 ${
                kept.length + files.length >= MAX_IMAGES ? "pointer-events-none opacity-40" : ""
              }`}
            >
              {m.board.pickPhotos}
              <input
                type="file"
                accept={ACCEPT.join(",")}
                multiple
                className="sr-only"
                disabled={kept.length + files.length >= MAX_IMAGES}
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {kept.length + previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {kept.map((path, i) => (
                <li key={path} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 이미 올린 사진 */}
                  <img src={postImageUrl(path)} alt={fmt(m.board.oldPhotoAlt, { n: i + 1 })} className="aspect-square w-full border border-lilac-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setKept(kept.filter((p) => p !== path))}
                    className="absolute top-1 right-1 bg-ink/70 px-1.5 text-xs text-white hover:bg-ink"
                    aria-label={fmt(m.board.removeOldPhoto, { n: i + 1 })}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {previews.map((src, i) => (
                <li key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기 */}
                  <img src={src} alt={fmt(m.board.attachAlt, { n: i + 1 })} className="aspect-square w-full border border-lilac-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-ink/70 px-1.5 text-xs text-white hover:bg-ink"
                    aria-label={fmt(m.board.removePhoto, { n: i + 1 })}
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
            {m.board.cancel}
          </button>
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? (files.length ? m.board.uploadingPhotos : m.board.saving) : editing ? m.board.saveEdit : m.board.post}
          </button>
        </div>
      </div>
    </form>
  );
}

export function CommentForm({ postId }: { postId: number }) {
  const { m } = useI18n();
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
          className={`${inputClass} flex-1 resize-none`}
          placeholder={m.board.commentPlaceholder}
        />
        <button type="submit" disabled={pending} className={`${buttonClass} w-20 shrink-0`}>
          {pending ? "…" : m.board.post}
        </button>
      </div>
      <FormMessage error={state?.error} />
    </form>
  );
}
