import type { Metadata } from "next";
import Countdown from "@/components/Countdown";
import { EmptyState, PageHeader, SampleBadge } from "@/components/ui";
import { getLatestComeback } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { localizeComeback } from "@/lib/localize";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.comeback.title };
}

// 티저 공개 완료 표시가 시간에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function ComebackPage() {
  const raw = await getLatestComeback();
  const { m, locale } = await getI18n();

  if (!raw) {
    return (
      <>
        <PageHeader eyebrow="Comeback" title={m.comeback.title} />
        <EmptyState>{m.comeback.empty}</EmptyState>
      </>
    );
  }

  const comeback = localizeComeback(raw, locale);
  const now = Date.now();
  const teasers = [...comeback.teasers].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <>
      <PageHeader eyebrow="Comeback" title={m.comeback.title} description={m.comeback.desc} />

      <div className="grid gap-5 md:grid-cols-5">
        <section className="card p-6 md:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-lilac-100 px-2.5 py-0.5 text-xs font-semibold text-lilac-700">
              {comeback.albumType}
            </span>
            <SampleBadge show={comeback.isSample} />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{comeback.albumTitle}</h2>

          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold text-ink-soft">{m.comeback.titleTrack}</dt>
            <dd className="font-semibold">{comeback.titleTrack}</dd>
            <dt className="font-semibold text-ink-soft">{m.comeback.releaseDate}</dt>
            <dd>{formatDateTime(comeback.releaseDate, locale)}</dd>
          </dl>
          {comeback.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{comeback.description}</p>
          )}
          {comeback.tracklist && comeback.tracklist.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink-soft">{m.comeback.tracklist}</p>
              <ol className="mt-1 list-inside list-decimal text-sm">
                {comeback.tracklist.map((track) => (
                  <li key={track}>{track}</li>
                ))}
              </ol>
            </div>
          )}
          {comeback.sourceUrl && (
            <a
              href={comeback.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-ink-soft underline"
            >
              {m.comeback.source}
            </a>
          )}

          <div className="mt-6 bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100 p-5">
            <p className="mb-2 text-sm font-semibold text-ink-soft">{m.comeback.remaining}</p>
            <Countdown target={comeback.releaseDate} />
          </div>
        </section>

        <section className="card p-6 md:col-span-2">
          <h2 className="font-bold">{m.comeback.teaserTitle}</h2>
          {teasers.length > 0 ? (
            <ol className="relative mt-4 space-y-4 border-l-2 border-lilac-200 pl-5">
              {teasers.map((t) => {
                const done = new Date(t.date).getTime() <= now;
                return (
                  <li key={t.date + t.title} className="relative">
                    <span
                      aria-hidden
                      className={`absolute top-1.5 -left-[27px] h-3 w-3 border-2 border-white ${
                        done ? "bg-lilac-300" : "bg-blush-400"
                      }`}
                    />
                    <p className="text-xs text-ink-soft">{formatDate(t.date, locale)}</p>
                    <p className={`text-sm font-semibold ${done ? "text-ink-soft line-through decoration-lilac-300" : ""}`}>
                      {t.title}
                    </p>
                  </li>
                );
              })}
              <li className="relative">
                <span aria-hidden className="absolute top-1.5 -left-[27px] h-3 w-3 border-2 border-white bg-lilac-500" />
                <p className="text-xs text-ink-soft">{formatDate(comeback.releaseDate, locale)}</p>
                <p className="text-sm font-bold text-lilac-700">{m.comeback.release}</p>
              </li>
            </ol>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">{m.comeback.noTeasers}</p>
          )}
        </section>
      </div>
    </>
  );
}
