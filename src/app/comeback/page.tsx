import type { Metadata } from "next";
import Countdown from "@/components/Countdown";
import { EmptyState, PageHeader, SampleBadge } from "@/components/ui";
import { getLatestComeback } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "컴백 안내" };

// 티저 공개 완료 표시가 시간에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function ComebackPage() {
  const comeback = await getLatestComeback();

  if (!comeback) {
    return (
      <>
        <PageHeader eyebrow="Comeback" title="컴백 안내" />
        <EmptyState>예정된 컴백 소식이 없어요.</EmptyState>
      </>
    );
  }

  const now = Date.now();
  const teasers = [...comeback.teasers].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <>
      <PageHeader eyebrow="Comeback" title="컴백 안내" description="컴백까지 함께 기다려요 ✦" />

      <div className="grid gap-5 md:grid-cols-5">
        <section className="card p-6 md:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lilac-100 px-2.5 py-0.5 text-xs font-semibold text-lilac-700">
              {comeback.albumType}
            </span>
            <SampleBadge show={comeback.isSample} />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{comeback.albumTitle}</h2>

          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold text-ink-soft">타이틀곡</dt>
            <dd className="font-semibold">{comeback.titleTrack}</dd>
            <dt className="font-semibold text-ink-soft">발매일</dt>
            <dd>{formatDateTime(comeback.releaseDate)}</dd>
          </dl>
          {comeback.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{comeback.description}</p>
          )}

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100 p-5">
            <p className="mb-2 text-sm font-semibold text-ink-soft">컴백까지 남은 시간</p>
            <Countdown target={comeback.releaseDate} />
          </div>
        </section>

        <section className="card p-6 md:col-span-2">
          <h2 className="font-bold">📅 티저 일정</h2>
          {teasers.length > 0 ? (
            <ol className="relative mt-4 space-y-4 border-l-2 border-lilac-200 pl-5">
              {teasers.map((t) => {
                const done = new Date(t.date).getTime() <= now;
                return (
                  <li key={t.date + t.title} className="relative">
                    <span
                      aria-hidden
                      className={`absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white ${
                        done ? "bg-lilac-300" : "bg-blush-400"
                      }`}
                    />
                    <p className="text-xs text-ink-soft">{formatDate(t.date)}</p>
                    <p className={`text-sm font-semibold ${done ? "text-ink-soft line-through decoration-lilac-300" : ""}`}>
                      {t.title}
                    </p>
                  </li>
                );
              })}
              <li className="relative">
                <span aria-hidden className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-lilac-500" />
                <p className="text-xs text-ink-soft">{formatDate(comeback.releaseDate)}</p>
                <p className="text-sm font-bold text-lilac-700">✦ 컴백 · 음원 발매</p>
              </li>
            </ol>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">티저 일정이 아직 공개되지 않았어요.</p>
          )}
        </section>
      </div>
    </>
  );
}
