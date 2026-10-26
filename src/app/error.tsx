"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="font-bold">잠시 문제가 생겼어요</p>
      <p className="mt-1 text-sm text-ink-soft">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-lilac-700 underline">
        다시 시도
      </button>
    </div>
  );
}
