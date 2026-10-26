import type { Metadata } from "next";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { EmptyState, ExternalButton, PageHeader, SampleBadge } from "@/components/ui";
import { getSongs } from "@/lib/data";
import { formatDate, platformLabels } from "@/lib/format";

export const metadata: Metadata = { title: "신곡" };

export default async function SongsPage() {
  const [latest, ...previous] = await getSongs();

  if (!latest) {
    return (
      <>
        <PageHeader eyebrow="New Release" title="신곡" />
        <EmptyState>등록된 곡이 없어요.</EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="New Release" title="신곡" description="공식 뮤직비디오와 음원 사이트 바로가기" />

      <section className="card p-4 sm:p-6">
        <YouTubeEmbed videoId={latest.youtubeId} title={`${latest.title} 뮤직비디오`} />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-xs font-bold text-blush-400">
            LATEST
          </span>
          <SampleBadge show={latest.isSample} />
        </div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{latest.title}</h2>
        <p className="text-sm text-ink-soft">
          {latest.album} · {formatDate(latest.releaseDate)}
        </p>
        {latest.streamingLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {latest.streamingLinks.map((link, i) => (
              <ExternalButton key={link.platform} href={link.url} variant={i === 0 ? "solid" : "soft"}>
                {platformLabels[link.platform]}
              </ExternalButton>
            ))}
          </div>
        )}
      </section>

      {previous.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">이전 곡</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {previous.map((song) => (
              <li key={song.id} className="card p-4">
                {song.youtubeId && (
                  <div className="mb-3">
                    <YouTubeEmbed videoId={song.youtubeId} title={`${song.title} 뮤직비디오`} />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{song.title}</p>
                    <p className="text-xs text-ink-soft">
                      {song.album} · {formatDate(song.releaseDate)}
                    </p>
                  </div>
                  <SampleBadge show={song.isSample} />
                </div>
                {song.streamingLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {song.streamingLinks.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-lilac-200 bg-white/80 px-3 py-1 text-xs font-medium hover:bg-lilac-100"
                      >
                        {platformLabels[link.platform]} ↗
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
