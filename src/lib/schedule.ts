/**
 * 일정 조회. data/schedule.ts 의 일정에 멤버 생일을 더해 날짜순으로 돌려줍니다.
 * 나중에 Supabase로 옮길 때 이 파일 안쪽만 바꾸면 됩니다.
 */
import { members, type MemberSlug } from "@/data/members";
import { schedule, type ScheduleEvent } from "@/data/schedule";

const DAY = 24 * 60 * 60 * 1000;

/** 오늘 기준 앞뒤 1년 안의 생일 일정 */
function birthdayEvents(now: Date): ScheduleEvent[] {
  const year = now.getFullYear();
  return members.flatMap((m) =>
    [year - 1, year, year + 1].map((y) => ({
      id: `birthday-${m.slug}-${y}`,
      date: `${y}-${m.birthday.slice(5)}T00:00:00+09:00`,
      allDay: true,
      title: `${m.name} 생일 🎂`,
      type: "birthday" as const,
      members: [m.slug],
    })),
  );
}

const endTime = (e: ScheduleEvent) => new Date(e.endDate ?? e.date).getTime() + (e.allDay ? DAY : 0);

/**
 * member 를 주면 그 멤버 개인 일정 + 단체 일정, "group" 이면 단체 일정만.
 * upcoming: 오늘 이후(진행 중 포함), past: 최근 지난 일정
 */
export async function getSchedule(member?: MemberSlug | "group", now: Date = new Date()) {
  const all = [...schedule, ...birthdayEvents(now)]
    .filter((e) => {
      const who = e.members ?? [];
      if (!member) return true;
      if (member === "group") return who.length === 0;
      return who.length === 0 || who.includes(member);
    })
    .filter((e) => Math.abs(new Date(e.date).getTime() - now.getTime()) < 366 * DAY)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const t = now.getTime();
  return {
    upcoming: all.filter((e) => endTime(e) > t),
    past: all.filter((e) => endTime(e) <= t).reverse().slice(0, 10),
  };
}
