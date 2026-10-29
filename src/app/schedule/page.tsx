import type { Metadata } from "next";
import Link from "next/link";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ScheduleList from "@/components/ScheduleList";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { getMonthSchedule, getSchedule, kstDateKey } from "@/lib/schedule";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.schedule.title };
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; view?: string }>;
}) {
  const { month: monthParam, view } = await searchParams;
  const { m } = await getI18n();
  const listView = view === "list";

  // ?month=2026-11 (없거나 잘못되면 이번 달, 한국 시간 기준)
  const [ty, tm] = kstDateKey(new Date()).split("-").map(Number);
  const match = /^(\d{4})-(\d{2})$/.exec(monthParam ?? "");
  const valid = match && Number(match[2]) >= 1 && Number(match[2]) <= 12;
  const year = valid ? Number(match[1]) : ty;
  const month = valid ? Number(match[2]) : tm;

  const href = (next: { month?: string | null; view?: string | null }) => {
    const q = new URLSearchParams();
    const mon = next.month === undefined ? monthParam : next.month;
    const v = next.view === undefined ? view : next.view;
    if (mon) q.set("month", mon);
    if (v === "list") q.set("view", "list");
    const qs = q.toString();
    return qs ? `/schedule?${qs}` : "/schedule";
  };

  return (
    <>
      <PageHeader eyebrow="Schedule" title={m.schedule.title} description={m.schedule.desc} />

      {/* 멤버 개인 일정은 생일 정도라 멤버별로 나누지 않고 한 번에 보여줌 (멤버 페이지에서는 그 멤버 일정만) */}
      <div className="mb-5 flex justify-end">
        <div className="flex border border-lilac-500 text-sm font-semibold" role="tablist" aria-label={m.schedule.viewAria}>
          <Link href={href({ view: null })} aria-current={!listView ? "page" : undefined} className={`px-3 py-1 ${!listView ? "bg-lilac-500 text-white" : "bg-white text-lilac-700"}`}>
            {m.schedule.calendar}
          </Link>
          <Link href={href({ view: "list" })} aria-current={listView ? "page" : undefined} className={`px-3 py-1 ${listView ? "bg-lilac-500 text-white" : "bg-white text-lilac-700"}`}>
            {m.schedule.list}
          </Link>
        </div>
      </div>

      {listView ? (
        <ListView />
      ) : (
        <ScheduleCalendar
          year={year}
          month={month}
          events={await getMonthSchedule(year, month)}
          hrefFor={(y, mo) => href({ month: `${y}-${String(mo).padStart(2, "0")}` })}
        />
      )}
    </>
  );
}

async function ListView() {
  const { upcoming, past } = await getSchedule(undefined, new Date(), true);
  const { m } = await getI18n();
  return (
    <>
      <ScheduleList events={upcoming} />
      {past.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-ink-soft">{m.schedule.pastToggle}</summary>
          <div className="mt-3 opacity-70">
            <ScheduleList events={past} />
          </div>
        </details>
      )}
    </>
  );
}
