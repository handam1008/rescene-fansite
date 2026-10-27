import Countdown from "@/components/Countdown";
import HomeHero from "@/components/HomeHero";
import PopularPosts from "@/components/PopularPosts";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import { VoteStatusBadge } from "@/components/VoteCard";
import { EmptyState, MoreLink, SampleBadge } from "@/components/ui";
import { getPopularPosts } from "@/lib/community";
import { getLatestComeback, getSongs, getVotes } from "@/lib/data";
import { getSchedule } from "@/lib/schedule";
import { formatDate, formatDateTime } from "@/lib/format";

// 인기글·투표 상태가 시간에 따라 바뀌므로 5분마다 다시 생성
export const revalidate = 300;

export default async function HomePage() {
  const [comeback, songs, votes, popularPosts, schedule] = await Promise.all([
    getLatestComeback(),
    getSongs(),
    getVotes(),
    getPopularPosts(5),
    getSchedule(),
  ]);
  const latestSong = songs[0];
  const activeVotes = votes.filter((v) => v.status !== "ended").slice(0, 3);

  return (
    <div className="space-y-8">
      <HomeHero />

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
              <div className="flex aspect-[2/1] items-center justify-center bg-gradient-to-br from-lilac-200 via-blush-100 to-sky-dream-100 text-4xl">
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
                <li key={vote.id} className="border border-lilac-100 bg-lilac-50 p-3">
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

      <div className="grid gap-5 md:grid-cols-2">
        <PopularPosts posts={popularPosts} />
        <UpcomingSchedule events={schedule.upcoming.slice(0, 5)} />
      </div>
    </div>
  );
}
