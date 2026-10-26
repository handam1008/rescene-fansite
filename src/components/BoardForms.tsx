"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/auth/actions";
import { addComment, createPost } from "@/app/board/actions";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function PostForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createPost, undefined);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">제목</span>
        <input name="title" required maxLength={100} className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold">내용</span>
        <textarea name="content" required maxLength={5000} rows={10} className={inputClass} />
      </label>
      <FormMessage error={state?.error} />
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "저장 중…" : "등록하기"}
      </button>
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
      <textarea name="content" required maxLength={1000} rows={3} className={inputClass} placeholder="댓글을 남겨주세요" />
      <FormMessage error={state?.error} />
      <div className="text-right">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "등록 중…" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
