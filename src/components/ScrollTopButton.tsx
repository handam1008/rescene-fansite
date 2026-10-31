"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";

/** 아래로 어느 정도 내리면 오른쪽 아래에 나타나는 "맨 위로" 버튼 */
export default function ScrollTopButton() {
  const { m } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={m.common.scrollTop}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex h-11 w-11 items-center justify-center border border-lilac-300 bg-white/90 text-lg text-lilac-700 shadow-sm backdrop-blur transition-opacity sm:right-6 sm:bottom-6 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
