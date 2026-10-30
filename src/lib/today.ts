import { fmt, INTL_LOCALE, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { getLatestComeback, getVotes } from "@/lib/data";
import { localizeComeback, localizeVote } from "@/lib/localize";
import { eventTitle, getSchedule, kstDateKey } from "@/lib/schedule";

/**
 * "오늘의 리센느" 카드에 들어갈 내용 (한국 날짜 기준).
 * 오늘 일정, 다가오는 일정 몇 개, 컴백 D-day, 마감이 가까운 투표
 */

const TZ = "Asia/Seoul";

/** "10.30 (금)" / "10.30 (金)" / "10.30 (Fri)" */
function shortDate(iso: string, locale: Locale) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TZ, month: "numeric", day: "numeric", weekday: "short" })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.month}.${p.day} (${p.weekday})`;
}

/** "18:00" (시간이 정해진 일정만) */
function time(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

export type TodayCard = Awaited<ReturnType<typeof getTodayCard>>;

export async function getTodayCard(locale: Locale, now: Date = new Date()) {
  const m = dictionaries[locale];
  const todayKey = kstDateKey(now);
  const [{ upcoming }, rawComeback, votes] = await Promise.all([getSchedule(undefined, now, true), getLatestComeback(), getVotes(now)]);

  const label = (e: (typeof upcoming)[number]) => eventTitle(e, locale) + (e.tentative ? m.schedule.tentativeSuffix : "");
  const isToday = (e: (typeof upcoming)[number]) => kstDateKey(e.date) <= todayKey && kstDateKey(e.endDate ?? e.date) >= todayKey;

  const today = upcoming.filter(isToday).slice(0, 4).map((e) => ({ title: label(e), time: e.allDay ? "" : time(e.date) }));
  const next = upcoming
    .filter((e) => !isToday(e))
    .slice(0, today.length ? 4 : 5)
    .map((e) => ({ title: label(e), date: shortDate(e.date, locale) }));

  let comeback: { album: string; big: string; kicker: string; when: string } | null = null;
  if (rawComeback) {
    const c = localizeComeback(rawComeback, locale);
    const days = Math.round((Date.parse(kstDateKey(c.releaseDate)) - Date.parse(todayKey)) / 86_400_000);
    if (days >= 0) {
      comeback = {
        album: c.albumTitle,
        big: days === 0 ? "D-DAY" : `D-${days}`,
        kicker: m.today.cardComeback,
        when: `${shortDate(c.releaseDate, locale)} ${time(c.releaseDate)}`,
      };
    } else if (days > -14) {
      comeback = { album: c.albumTitle, big: c.titleTrack, kicker: m.today.cardOut, when: shortDate(c.releaseDate, locale) };
    }
  }

  const closing = votes
    .filter((v) => v.status === "ongoing")
    .slice(0, 2)
    .map((v) => {
      const lv = localizeVote(v, locale);
      return { title: lv.awardName, ends: fmt(m.today.cardVoteEnds, { date: shortDate(v.endDate, locale) }) };
    });

  return { dateLabel: shortDate(now.toISOString(), locale), dateKey: todayKey, today, next, comeback, closing };
}
