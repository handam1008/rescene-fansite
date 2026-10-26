/** 공식 유튜브 영상 임베드. 영상 파일을 직접 올리지 않고 유튜브 플레이어만 사용합니다. */
export default function YouTubeEmbed({ videoId, title }: { videoId?: string; title: string }) {
  if (!videoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-lilac-200 bg-lilac-50/70 p-4 text-center text-sm text-ink-soft">
        <span className="text-2xl" aria-hidden>▶</span>
        <span>뮤직비디오 자리 (예시)</span>
        <span className="text-xs">
          src/data/songs.ts 의 youtubeId에 공식 유튜브 영상 ID를 넣어주세요
        </span>
      </div>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden bg-lilac-100">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
