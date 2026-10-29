import Countdown from "@/components/Countdown";
import HomeHero from "@/components/HomeHero";
import PokedexNews from "@/components/PokedexNews";
import PopularPosts from "@/components/PopularPosts";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import { VoteStatusBadge } from "@/components/VoteCard";
import { EmptyState, MoreLink, SampleBadge } from "@/components/ui";
import { getContributorRanking, getPokedexNews, getPopularPosts } from "@/lib/community";
import { getLatestComeback, getSongs, getVotes } from "@/lib/data";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { albumLabel } from "@/lib/album";
import { localizeComeback, localizeVote } from "@/lib/localize";
import { getSchedule } from "@/lib/schedule";
import { formatDate, formatDateTime } from "@/lib/format";

// 인기글·투표 상태가 시간에 따라 바뀌므로 5분마다 다시 생성
export const revalidate = 300;

export default async function HomePage() {
  const [rawComeback, songs, votes, popularPosts, schedule, pokedex, ranking] = await Promise.all([
    getLatestComeback(),
    getSongs(),
    getVotes(),
    getPopularPosts(5),
    getSchedule(),
    getPokedexNews(5),
    getContributorRanking(3),
  ]);
  const { m, locale } = await getI18n();
  const comeback = rawComeback && localizeComeback(rawComeback, locale);
  const latestSong = songs[0];
  const activeVotes = votes
    .filter((v) => v.status !== "ended")
    .slice(0, 2)
    .map((v) => localizeVote(v, locale));

  return (
    <div className="space-y-8">
      <HomeHero />

      <div className="grid gap-5 md:grid-cols-3">
        {/* 컴백 */}
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">{m.home.comebackTitle}</h2>
            {comeback && <SampleBadge show={comeback.isSample} />}
          </div>
          {comeback ? (
            <div className="mt-4 flex-1">
              <Countdown target={comeback.releaseDate} compact />
              <p className="mt-2 font-semibold">{comeback.albumTitle}</p>
              <p className="text-sm text-ink-soft">{fmt(m.home.titleTrack, { t: comeback.titleTrack })}</p>
              <p className="mt-1 text-sm text-ink-soft">{fmt(m.home.releaseAt, { date: formatDateTime(comeback.releaseDate, locale) })}</p>
            </div>
          ) : (
            <p className="mt-4 flex-1 text-sm text-ink-soft">{m.home.noComeback}</p>
          )}
          <div className="mt-4">
            <MoreLink href="/comeback">{m.home.comebackMore}</MoreLink>
          </div>
        </section>

        {/* 신곡 */}
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">{m.home.songTitle}</h2>
            {latestSong && <SampleBadge show={latestSong.isSample} />}
          </div>
          {latestSong ? (
            <div className="mt-4 flex-1">
              <div className="flex aspect-[2/1] items-center justify-center bg-gradient-to-br from-lilac-200 via-blush-100 to-sky-dream-100 text-4xl">
                ♪
              </div>
              <p className="mt-3 text-lg font-semibold">{latestSong.title}</p>
              <p className="text-sm text-ink-soft">
                {albumLabel(latestSong.album, locale)} · {formatDate(latestSong.releaseDate, locale)}
              </p>
            </div>
          ) : (
            <p className="mt-4 flex-1 text-sm text-ink-soft">{m.home.noSong}</p>
          )}
          <div className="mt-4">
            <MoreLink href="/songs">{m.home.songMore}</MoreLink>
          </div>
        </section>

        {/* 투표 */}
        <section className="card flex flex-col p-5">
          <h2 className="font-bold">{m.home.voteTitle}</h2>
          {activeVotes.length > 0 ? (
            <ul className="mt-4 flex-1 space-y-3">
              {activeVotes.map((vote) => (
                <li key={vote.id} className="border border-lilac-100 bg-lilac-50 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <VoteStatusBadge status={vote.status} />
                    <SampleBadge show={vote.isSample} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold">{vote.awardName}</p>
                  <p className="text-xs text-ink-soft">{fmt(m.home.voteEnds, { date: formatDateTime(vote.endDate, locale) })}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex-1">
              <EmptyState>{m.home.noVote}</EmptyState>
            </div>
          )}
          <div className="mt-4">
            <MoreLink href="/votes">{m.home.voteMore}</MoreLink>
          </div>
        </section>
      </div>

      {/* 넓은 PC 화면에서는 양옆 사이드바에 같은 내용이 있어서 숨김 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 wide:hidden">
        <PopularPosts posts={popularPosts} />
        <UpcomingSchedule events={schedule.upcoming.slice(0, 5)} />
      </div>

      {pokedex && pokedex.total > 0 && <PokedexNews {...pokedex} ranking={ranking} />}
    </div>
  );
}
