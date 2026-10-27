"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useState } from "react";
import { reportPost, votePost } from "@/app/board/actions";
import { reportReasons } from "@/data/moderation";
import { FormMessage, inputClass } from "./ui";

/**
 * 글 아래 추천·비추천 버튼과 신고.
 * 본인 글이거나 숨겨진 글이면 숫자만 보여주고 누를 수 없음 (DB 규칙도 같은 걸 막음)
 * 추천·비추천은 한 번 누르면 바꾸거나 취소할 수 없음 (0010).
 * 누르면 서버 응답을 기다리지 않고 숫자를 바로 바꿔 보여줌 (응답이 오면 실제 값으로 맞춰짐)
 */
export default function PostReactions({
  postId,
  likes,
  dislikes,
  myVote,
  reported,
  loggedIn,
  canReact,
  isOwner,
}: {
  postId: number;
  likes: number;
  dislikes: number;
  myVote: number;
  reported: boolean;
  loggedIn: boolean;
  canReact: boolean;
  isOwner: boolean;
}) {
  const [showReport, setShowReport] = useState(false);
  const [state, action, pending] = useActionState(reportPost, undefined);
  const loginHref = `/login?next=/board/${postId}`;
  const [view, applyVote] = useOptimistic({ myVote, likes, dislikes }, (cur, value: 1 | -1) =>
    cur.myVote !== 0
      ? cur
      : { myVote: value, likes: cur.likes + (value === 1 ? 1 : 0), dislikes: cur.dislikes + (value === -1 ? 1 : 0) },
  );
  const voted = view.myVote !== 0;

  const voteButton = (value: 1 | -1) => {
    const active = view.myVote === value;
    const label = value === 1 ? "추천" : "비추";
    const count = value === 1 ? view.likes : view.dislikes;
    // 누르기 전에는 두 버튼 모양이 같고, 내가 누른 쪽만 색이 채워짐
    const className = `btn flex w-24 flex-col items-center border-2 py-2 font-bold ${
      active
        ? value === 1
          ? "border-lilac-500 bg-lilac-500 text-white"
          : "border-ink-soft bg-ink-soft text-white"
        : `border-lilac-200 bg-white hover:bg-lilac-50 ${value === 1 ? "text-lilac-700" : "text-ink-soft"}`
    }`;
    const inner = (
      <>
        <span className="text-lg tabular-nums">{count}</span>
        <span className="text-xs">
          {value === 1 ? "👍" : "👎"} {label}
        </span>
      </>
    );
    // 본인 글·숨긴 글이거나 이미 누른 뒤에는 숫자만 (누른 쪽은 색으로 표시)
    if (!canReact || voted) {
      return <div className={`${className} pointer-events-none ${active ? "" : "opacity-60"}`}>{inner}</div>;
    }
    if (!loggedIn) {
      return (
        <Link href={loginHref} className={className}>
          {inner}
        </Link>
      );
    }
    return (
      <form
        action={async (formData) => {
          applyVote(value);
          await votePost(formData);
        }}
      >
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="value" value={value} />
        <button type="submit" aria-pressed={active} className={className}>
          {inner}
        </button>
      </form>
    );
  };

  return (
    <div className="border-t border-lilac-100 px-4 py-5 sm:px-5">
      <div className="flex justify-center gap-3">
        {voteButton(1)}
        {voteButton(-1)}
      </div>
      <p className="mt-2 text-center text-xs text-ink-soft">
        {isOwner
          ? "내 글에는 추천·비추천과 신고를 할 수 없어요."
          : voted
            ? `${view.myVote === 1 ? "추천" : "비추천"}했어요. 한 번 누르면 바꿀 수 없어요.`
            : canReact && loggedIn
              ? "한 번 누르면 바꾸거나 취소할 수 없어요."
              : null}
      </p>

      {canReact && (
        <div className="mt-3 text-right text-xs">
          {reported || state?.message ? (
            <span className="text-ink-soft">🚨 신고한 글이에요</span>
          ) : !loggedIn ? (
            <Link href={loginHref} className="text-ink-soft underline hover:text-ink">
              🚨 신고
            </Link>
          ) : (
            <button type="button" onClick={() => setShowReport((v) => !v)} className="text-ink-soft underline hover:text-ink">
              🚨 신고
            </button>
          )}
        </div>
      )}

      {showReport && !reported && !state?.message && (
        <form action={action} className="mt-2 space-y-2 border border-lilac-200 bg-lilac-50 p-3 text-sm">
          <input type="hidden" name="postId" value={postId} />
          <fieldset>
            <legend className="mb-1.5 font-semibold">신고 사유</legend>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {Object.entries(reportReasons).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5">
                  <input type="radio" name="reason" value={key} required />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <input name="detail" maxLength={200} placeholder="자세한 내용 (선택)" className={inputClass} />
          <FormMessage error={state?.error} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowReport(false)} className="border border-lilac-200 bg-white px-3 py-1.5">
              취소
            </button>
            <button type="submit" disabled={pending} className="border border-ink bg-ink px-3 py-1.5 font-bold text-white">
              {pending ? "신고 중…" : "신고하기"}
            </button>
          </div>
          <p className="text-[11px] text-ink-soft">
            신고가 여러 건 쌓이면 글이 자동으로 숨겨지고 운영자가 확인해요. 허위 신고는 제재될 수 있어요.
          </p>
        </form>
      )}
      {state?.message && <p className="mt-2 text-right text-xs text-lilac-700">{state.message}</p>}
    </div>
  );
}
