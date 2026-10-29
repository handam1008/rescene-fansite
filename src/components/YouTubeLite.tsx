"use client";

import { useState } from "react";

/**
 * 유튜브 썸네일만 먼저 보여주고, 누르면 그 자리에서 영상 재생.
 * 페이지를 열 때 유튜브 플레이어를 바로 불러오지 않아서 홈이 가벼움.
 */
export default function YouTubeLite({ videoId, title, playLabel }: { videoId: string; title: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-ink">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={playLabel}
      className="group relative block aspect-video w-full overflow-hidden bg-lilac-100"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 유튜브 썸네일 */}
      <img
        src={`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-ink/10 transition group-hover:bg-ink/25">
        <span className="flex h-12 w-16 items-center justify-center bg-red-600 text-white shadow-lg">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
