import Countdown from "@/components/Countdown";
import { VoteStatusBadge } from "@/components/VoteCard";
import { EmptyState, MoreLink, SampleBadge } from "@/components/ui";
import { getLatestComeback, getSongs, getVotes } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";

// 투표 진행/종료 상태가 시간에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function HomePage() {
  const [comeback, songs, votes] = await Promise.all([
    getLatestComeback(),
    getSongs(),
    getVotes(),
  ]);
  const latestSong = songs[0];
  const activeVotes = votes.filter((v) => v.status !== "ended").slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="card relative overflow-hidden px-6 py-10 text-center sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full bg-blush-200/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-16 h-48 w-48 rounded-full bg-sky-dream-200/70 blur-3xl" />
        <p className="relative text-xs font-semibold tracking-[0.3em] text-lilac-500">
          UNOFFICIAL FANSITE
        </p>
        <h1 className="text-dreamy relative mt-2 text-4xl font-extrabold sm:text-5xl">RESCENE</h1>
        <p className="relative mt-3 text-sm text-ink-soft">
          리센느의 컴백 · 신곡 · 투표 소식을 한눈에
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {/* 컴백 */}
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">💌 최신 컴백 소식</h2>
            {comeback && <SampleBadge show={comeback.isSample} />}
          </div>
          {comeback ? (
            <div className="mt-4 flex-1">
              <Countdown target={comeback.releaseDate} compact />
              <p className="mt-2 font-semibold">{comeback.albumTitle}</p>
              <p className="text-sm text-ink-soft">타이틀곡 · {comeback.titleTrack}</p>
              <p className="mt-1 text-sm text-ink-soft">{formatDateTime(comeback.releaseDate)} 발매</p>
            </div>
          ) : (
            <p className="mt-4 flex-1 text-sm text-ink-soft">예정된 컴백 소식이 없어요.</p>
          )}
          <div className="mt-4">
            <MoreLink href="/comeback">컴백 일정 보기</MoreLink>
          </div>
        </section>

        {/* 신곡 */}
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">🎧 최신 신곡</h2>
            {latestSong && <SampleBadge show={latestSong.isSample} />}
          </div>
          {latestSong ? (
            <div className="mt-4 flex-1">
              <div className="flex aspect-[2/1] items-center justify-center rounded-2xl bg-gradient-to-br from-lilac-200 via-blush-100 to-sky-dream-100 text-4xl">
                ♪
              </div>
              <p className="mt-3 text-lg font-semibold">{latestSong.title}</p>
              <p className="text-sm text-ink-soft">
                {latestSong.album} · {formatDate(latestSong.releaseDate)}
              </p>
            </div>
          ) : (
            <p className="mt-4 flex-1 text-sm text-ink-soft">등록된 곡이 없어요.</p>
          )}
          <div className="mt-4">
            <MoreLink href="/songs">뮤비 · 음원 링크</MoreLink>
          </div>
        </section>

        {/* 투표 */}
        <section className="card flex flex-col p-5">
          <h2 className="font-bold">🗳️ 진행 중인 투표</h2>
          {activeVotes.length > 0 ? (
            <ul className="mt-4 flex-1 space-y-3">
              {activeVotes.map((vote) => (
                <li key={vote.id} className="rounded-2xl bg-white/70 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <VoteStatusBadge status={vote.status} />
                    <SampleBadge show={vote.isSample} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold">{vote.awardName}</p>
                  <p className="text-xs text-ink-soft">~ {formatDateTime(vote.endDate)} 마감</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex-1">
              <EmptyState>지금 진행 중인 투표가 없어요.</EmptyState>
            </div>
          )}
          <div className="mt-4">
            <MoreLink href="/votes">투표 방법 보기</MoreLink>
          </div>
        </section>
      </div>
    </div>
  );
}
