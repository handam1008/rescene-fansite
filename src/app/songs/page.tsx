import type { Metadata } from "next";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { EmptyState, ExternalButton, PageHeader, SampleBadge } from "@/components/ui";
import { getSongs } from "@/lib/data";
import { formatDate, platformLabels } from "@/lib/format";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { albumLabel } from "@/lib/album";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.songs.title };
}

// 발매 시각이 지난 곡이 자동으로 나타나도록 1시간마다 다시 생성
export const revalidate = 3600;

export default async function SongsPage() {
  const [latest, ...previous] = await getSongs();
  const { m, locale } = await getI18n();
  const platforms = platformLabels(locale);

  if (!latest) {
    return (
      <>
        <PageHeader eyebrow="New Release" title={m.songs.title} />
        <EmptyState>{m.songs.empty}</EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="New Release" title={m.songs.title} description={m.songs.desc} />

      <section className="card p-4 sm:p-6">
        <YouTubeEmbed videoId={latest.youtubeId} title={fmt(m.songs.mvTitle, { title: latest.title })} />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="bg-blush-100 px-2.5 py-0.5 text-xs font-bold text-blush-400">
            LATEST
          </span>
          <SampleBadge show={latest.isSample} />
        </div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{latest.title}</h2>
        <p className="text-sm text-ink-soft">
          {albumLabel(latest.album, locale)} · {formatDate(latest.releaseDate, locale)}
        </p>
        {latest.streamingLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {latest.streamingLinks.map((link, i) => (
              <ExternalButton key={link.platform} href={link.url} variant={i === 0 ? "solid" : "soft"}>
                {platforms[link.platform]}
              </ExternalButton>
            ))}
          </div>
        )}
      </section>

      {previous.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">{m.songs.previous}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {previous.map((song) => (
              <li key={song.id} className="card p-4">
                {song.youtubeId && (
                  // 이전 곡은 가벼운 썸네일만 보여주고, 누르면 유튜브에서 재생
                  <a
                    href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative mb-3 block aspect-video overflow-hidden bg-lilac-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- 유튜브 썸네일 */}
                    <img
                      src={`https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`}
                      alt={fmt(m.songs.thumbAlt, { title: song.title })}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/10 text-3xl text-white group-hover:bg-ink/25">
                      ▶
                    </span>
                  </a>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{song.title}</p>
                    <p className="text-xs text-ink-soft">
                      {albumLabel(song.album, locale)} · {formatDate(song.releaseDate, locale)}
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
                        className="border border-lilac-200 bg-white px-3 py-1 text-xs font-medium hover:bg-lilac-100"
                      >
                        {platforms[link.platform]} ↗
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
