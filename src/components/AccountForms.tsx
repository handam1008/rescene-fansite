"use client";

import { useActionState } from "react";
import { deleteAccount, updateNickname } from "@/app/account/actions";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function NicknameForm({ current, next }: { current: string; next?: string }) {
  const [state, action, pending] = useActionState(updateNickname, undefined);
  return (
    <form action={action} className="space-y-2">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex gap-2">
        <input
          name="nickname"
          required
          minLength={2}
          maxLength={20}
          defaultValue={current.startsWith("user_") ? "" : current}
          placeholder="2~20자"
          aria-label="닉네임"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <button type="submit" disabled={pending} className={`${buttonClass} shrink-0`}>
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
      <FormMessage error={state?.error} message={state?.message} />
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form action={action} className="space-y-2">
      <p className="text-sm text-ink-soft">
        탈퇴하면 계정과 내가 쓴 글·댓글·추천·신고·포카 인증 기록, 올린 사진이 바로 지워지고 되돌릴 수 없어요. 도감
        이미지로 공개에 동의해 쓰인 사진은 도감에 남고, 제공자 표시(닉네임)만 지워져요.
      </p>
      <div className="flex gap-2">
        <input name="confirm" placeholder="탈퇴 라고 적어주세요" aria-label="탈퇴 확인" className={`${inputClass} min-w-0 flex-1`} />
        <button type="submit" disabled={pending} className="shrink-0 border border-ink bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {pending ? "처리 중…" : "회원 탈퇴"}
        </button>
      </div>
      <FormMessage error={state?.error} />
    </form>
  );
}
