import type { Metadata } from "next";
import Link from "next/link";
import GuideChecklist, { type GuideTask } from "@/components/GuideChecklist";
import ShareButtons from "@/components/ShareButtons";
import { MoreLink, PageHeader } from "@/components/ui";
import { fanEvents, musicShows } from "@/data/guide";
import { getMember, nameOf } from "@/data/members";
import { searchLinks, songs } from "@/data/songs";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getLatestComeback, getVotes } from "@/lib/data";
import { formatDate, formatDateTime, platformLabels } from "@/lib/format";
import { localizeVote } from "@/lib/localize";
import { eventPlace, eventTitle, getSchedule, kstDateKey } from "@/lib/schedule";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.guide.metaTitle, description: m.guide.desc };
}

// 오늘 할 일·이번 주 일정이 날짜에 따라 바뀌므로 30분마다 다시 생성
export const revalidate = 1800;

const DAY = 24 * 60 * 60 * 1000;
const WATCH_TYPES = new Set(["broadcast", "event", "content"]);

export default async function GuidePage() {
  const now = new Date();
  const [{ m, locale }, comeback, votes, { upcoming }] = await Promise.all([
    getI18n(),
    getLatestComeback(),
    getVotes(now),
    getSchedule(undefined, now, true),
  ]);
  const today = kstDateKey(now);

  // 컴백 전이면 D-day, 후면 활동 며칠째 (한국 날짜 기준)
  let badge = "";
  const released = comeback ? new Date(comeback.releaseDate) <= now : false;
  if (comeback) {
    const diff = Math.round((Date.parse(kstDateKey(comeback.releaseDate)) - Date.parse(today)) / DAY);
    badge = released ? fmt(m.guide.dayN, { n: 1 - diff }) : fmt(m.guide.daysToGo, { dday: diff === 0 ? "D-DAY" : `D-${diff}` });
  }

  // 오늘 할 일: 듣기·뮤비 → 오늘 방송 → 진행 중 투표 → 사이트 안 참여
  const title = songs.find((s) => s.id === "with");
  const melon = searchLinks(released ? "PULSE" : "").find((l) => l.platform === "melon")!;
  const ongoing = votes.filter((v) => v.status === "ongoing").map((v) => localizeVote(v, locale));
  const todays = upcoming.filter((e) => !e.tentative && WATCH_TYPES.has(e.type) && kstDateKey(e.date) <= today && kstDateKey(e.endDate ?? e.date) >= today);
  const tasks: GuideTask[] = [
    { id: "listen", label: released ? m.guide.taskListenAfter : m.guide.taskListenBefore, href: melon.url, external: true },
    {
      id: "mv",
      label: released ? m.guide.taskMvAfter : m.guide.taskMvBefore,
      href:
        released && title?.youtubeId
          ? `https://www.youtube.com/watch?v=${title.youtubeId}`
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(released ? "RESCENE With MV" : "RESCENE 리센느")}`,
      external: true,
    },
    ...todays.map((e) => ({
      id: `watch-${e.id}`,
      label: fmt(m.guide.taskWatch, { title: eventTitle(e, locale) }),
      href: e.live ?? e.link ?? "/schedule",
      external: Boolean(e.live ?? e.link),
    })),
    ...ongoing.map((v) => ({
      id: `vote-${v.id}`,
      label: fmt(m.guide.taskVote, { name: [v.awardName, v.category].filter(Boolean).join(" ") }),
      href: "/votes",
    })),
    { id: "cheer", label: m.guide.taskCheer, href: "/cheer" },
    { id: "poll", label: m.guide.taskPoll, href: "/" },
  ];

  const week = upcoming.filter((e) => e.type !== "birthday" || e.members?.length).filter((e) => new Date(e.date).getTime() < now.getTime() + 7 * DAY);
  const openFanEvents = fanEvents.filter((f) => new Date(f.applyEnd) > now).sort((a, b) => a.applyEnd.localeCompare(b.applyEnd));
  const labels = platformLabels(locale);

  return (
    <>
      <PageHeader eyebrow="Guide" title={m.guide.title} description={m.guide.desc} />
      <div className="-mt-3 mb-5 flex flex-wrap items-center gap-3">
        {badge && <span className="bg-lilac-500 px-3 py-1 text-sm font-extrabold text-white">{badge}</span>}
        <ShareButtons text={`${m.guide.title} · RESCENE`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <GuideChecklist tasks={tasks} dateKey={today} />

          <section className="card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">📅 {m.guide.weekTitle}</h2>
              <MoreLink href="/schedule">{m.schedule.all}</MoreLink>
            </div>
            {week.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{m.guide.weekEmpty}</p>
            ) : (
              <ul className="mt-3 divide-y divide-lilac-100">
                {week.map((e) => {
                  const who = (e.members ?? []).flatMap((s) => {
                    const mem = getMember(s);
                    return mem ? [nameOf(mem, locale)] : [];
                  });
                  const place = eventPlace(e, locale);
                  return (
                    <li key={e.id} className="py-2.5 text-sm">
                      <p className="text-xs font-semibold text-lilac-700 tabular-nums">
                        {e.allDay ? formatDate(e.date, locale) : formatDateTime(e.date, locale)}
                        {e.tentative && <span className="ml-1.5 border border-dashed border-lilac-300 px-1 font-normal text-ink-soft">{m.schedule.tentative}</span>}
                      </p>
                      <p className={`mt-0.5 ${e.important ? "font-bold" : "font-semibold"}`}>
                        {e.important && <span className="mr-0.5 text-amber-500">★</span>}
                        {e.link ? (
                          <a href={e.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {eventTitle(e, locale)}
                          </a>
                        ) : (
                          eventTitle(e, locale)
                        )}
                      </p>
                      <p className="text-xs text-ink-soft">{[who.length ? who.join(", ") : m.schedule.group, place].filter(Boolean).join(" · ")}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-bold">✍️ {m.guide.fanTitle}</h2>
            {openFanEvents.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{m.guide.fanEmpty}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {openFanEvents.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 border border-lilac-100 bg-lilac-50 p-3 text-sm">
                    <span>
                      <span className="mr-1.5 bg-white px-1.5 text-xs font-bold text-lilac-700">{f.kind === "video" ? m.guide.fanVideo : m.guide.fanOffline}</span>
                      <span className="font-semibold">{f.shop}</span>
                      <span className="block text-xs text-ink-soft">
                        {fmt(m.guide.fanApplyEnd, { date: formatDateTime(f.applyEnd, locale) })}
                        {f.eventDate && ` · ${fmt(m.guide.fanEventDate, { date: formatDate(f.eventDate, locale) })}`}
                      </span>
                    </span>
                    <a href={f.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-lilac-700 hover:underline">
                      {m.guide.fanApply} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="font-bold">📺 {m.guide.showsTitle}</h2>
            <ul className="mt-3 divide-y divide-lilac-100 text-sm">
              {musicShows.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2">
                  <span className="w-10 shrink-0 bg-lilac-100 py-0.5 text-center text-xs font-bold text-lilac-700">{m.guide.weekdays[s.weekday]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{s.name[locale]}</span>
                    <span className="block text-xs text-ink-soft">{s.channel}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{s.time[locale]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-soft">{m.guide.showsHint}</p>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">🗳️ {m.nav.votes}</h2>
            {ongoing.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{m.votes.empty}</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {ongoing.map((v) => (
                  <li key={v.id} className="border border-lilac-100 bg-lilac-50 p-3">
                    <p className="font-semibold">{[v.awardName, v.category].filter(Boolean).join(" · ")}</p>
                    <p className="text-xs text-ink-soft">{fmt(m.home.voteEnds, { date: formatDateTime(v.endDate, locale) })}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <MoreLink href="/votes">{m.guide.votesMore}</MoreLink>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">🎧 {m.guide.streamTitle}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {searchLinks(released ? "PULSE" : "").map((l) => (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-lilac-200 bg-white px-2 py-2 text-center text-xs font-bold hover:border-lilac-400"
                >
                  {labels[l.platform]}
                </a>
              ))}
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-ink-soft">
              {m.guide.streamTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">📣 {m.guide.chantTitle}</h2>
            <p className="mt-3 text-sm text-ink-soft">{m.guide.chantEmpty}</p>
            <Link href="/cheer" className="mt-3 inline-block text-sm font-semibold text-lilac-700 hover:underline">
              {m.cheer.homeLink} →
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
