/**
 * 일정 조회. data/schedule.ts 의 일정에 멤버 생일과 곡 발매일(data/songs.ts)을 더해 날짜순으로 돌려줍니다.
 * 나중에 Supabase로 옮길 때 이 파일 안쪽만 바꾸면 됩니다.
 */
import { members, type MemberSlug } from "@/data/members";
import { schedule, type ScheduleEvent } from "@/data/schedule";
import { songs } from "@/data/songs";

const DAY = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 날짜 "YYYY-MM-DD" */
export function kstDateKey(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** 주어진 해들의 멤버 생일 일정 */
function birthdayEvents(years: number[]): ScheduleEvent[] {
  return members.flatMap((m) =>
    years.map((y) => ({
      id: `birthday-${m.slug}-${y}`,
      date: `${y}-${m.birthday.slice(5)}T00:00:00+09:00`,
      allDay: true,
      title: `${m.name} 생일 🎂`,
      type: "birthday" as const,
      members: [m.slug],
    })),
  );
}

/** 곡 발매일 (같은 앨범은 한 번만, schedule.ts 에 이미 적힌 발매일은 빼고) */
function releaseEvents(): ScheduleEvent[] {
  const listed = new Set(schedule.filter((e) => e.type === "release").map((e) => kstDateKey(e.date)));
  const seen = new Set<string>();
  return songs
    .filter((s) => !s.isSample && !listed.has(kstDateKey(s.releaseDate)))
    .filter((s) => (seen.has(s.album) ? false : (seen.add(s.album), true)))
    .map((s) => ({
      id: `song-${s.id}`,
      date: s.releaseDate,
      title: `${s.album} 발매 · ${s.title}`,
      type: "release" as const,
      place: "각종 음원 사이트",
      link: s.youtubeId ? `https://www.youtube.com/watch?v=${s.youtubeId}` : undefined,
    }));
}

function forMember(member: MemberSlug | "group" | undefined) {
  return (e: ScheduleEvent) => {
    const who = e.members ?? [];
    if (!member) return true;
    if (member === "group") return who.length === 0;
    return who.length === 0 || who.includes(member);
  };
}

const byDate = (a: ScheduleEvent, b: ScheduleEvent) => new Date(a.date).getTime() - new Date(b.date).getTime();
const endTime = (e: ScheduleEvent) => new Date(e.endDate ?? e.date).getTime() + (e.allDay ? DAY : 0);

/**
 * member 를 주면 그 멤버 개인 일정 + 단체 일정, "group" 이면 단체 일정만.
 * upcoming: 오늘 이후(진행 중 포함), past: 최근 지난 일정
 */
export async function getSchedule(member?: MemberSlug | "group", now: Date = new Date()) {
  const year = now.getFullYear();
  const all = [...schedule, ...releaseEvents(), ...birthdayEvents([year - 1, year, year + 1])]
    .filter(forMember(member))
    .filter((e) => Math.abs(new Date(e.date).getTime() - now.getTime()) < 366 * DAY)
    .sort(byDate);

  const t = now.getTime();
  return {
    upcoming: all.filter((e) => endTime(e) > t),
    past: all.filter((e) => endTime(e) <= t).reverse().slice(0, 10),
  };
}

/** 달력용: year 년 month 월(1~12)에 하루라도 걸친 일정 */
export async function getMonthSchedule(year: number, month: number, member?: MemberSlug | "group") {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
  return [...schedule, ...releaseEvents(), ...birthdayEvents([year])]
    .filter(forMember(member))
    .filter((e) => kstDateKey(e.date) <= last && kstDateKey(e.endDate ?? e.date) >= first)
    .sort(byDate);
}
