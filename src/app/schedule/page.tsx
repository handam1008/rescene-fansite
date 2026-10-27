import type { Metadata } from "next";
import Link from "next/link";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ScheduleList from "@/components/ScheduleList";
import { PageHeader } from "@/components/ui";
import { getMember, members, type MemberSlug } from "@/data/members";
import { getMonthSchedule, getSchedule, kstDateKey } from "@/lib/schedule";

export const metadata: Metadata = { title: "일정" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; month?: string; view?: string }>;
}) {
  const { member, month: monthParam, view } = await searchParams;
  const selected: MemberSlug | "group" | undefined =
    member === "group" ? "group" : (getMember(member)?.slug as MemberSlug | undefined);
  const listView = view === "list";

  // ?month=2026-11 (없거나 잘못되면 이번 달, 한국 시간 기준)
  const [ty, tm] = kstDateKey(new Date()).split("-").map(Number);
  const m = /^(\d{4})-(\d{2})$/.exec(monthParam ?? "");
  const year = m && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? Number(m[1]) : ty;
  const month = m && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? Number(m[2]) : tm;

  const href = (next: { member?: string | null; month?: string | null; view?: string | null }) => {
    const q = new URLSearchParams();
    const mem = next.member === undefined ? member : next.member;
    const mon = next.month === undefined ? monthParam : next.month;
    const v = next.view === undefined ? view : next.view;
    if (mem && (mem === "group" || getMember(mem))) q.set("member", mem);
    if (mon) q.set("month", mon);
    if (v === "list") q.set("view", "list");
    const qs = q.toString();
    return qs ? `/schedule?${qs}` : "/schedule";
  };

  const filters = [
    { label: "전체", key: null, active: !selected },
    { label: "단체", key: "group", active: selected === "group" },
    ...members.map((mm) => ({ label: mm.name, key: mm.slug, active: selected === mm.slug })),
  ];

  return (
    <>
      <PageHeader eyebrow="Schedule" title="일정" description="리센느 단체 일정과 멤버별 일정을 모아봐요. 공식 발표·보도로 확인한 일정만 올려요." />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="멤버별 보기" className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <ul className="flex gap-1.5 whitespace-nowrap">
            {filters.map((f) => (
              <li key={f.label}>
                <Link
                  href={href({ member: f.key })}
                  aria-current={f.active ? "page" : undefined}
                  className={`block border px-3 py-1 text-sm ${
                    f.active ? "border-lilac-500 bg-lilac-500 font-semibold text-white" : "border-lilac-200 bg-white hover:bg-lilac-100"
                  }`}
                >
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex border border-lilac-500 text-sm font-semibold" role="tablist" aria-label="보기 방식">
          <Link href={href({ view: null })} aria-current={!listView ? "page" : undefined} className={`px-3 py-1 ${!listView ? "bg-lilac-500 text-white" : "bg-white text-lilac-700"}`}>
            📅 달력
          </Link>
          <Link href={href({ view: "list" })} aria-current={listView ? "page" : undefined} className={`px-3 py-1 ${listView ? "bg-lilac-500 text-white" : "bg-white text-lilac-700"}`}>
            목록
          </Link>
        </div>
      </div>

      {listView ? (
        <ListView member={selected} />
      ) : (
        <ScheduleCalendar
          year={year}
          month={month}
          events={await getMonthSchedule(year, month, selected)}
          hrefFor={(y, mo) => href({ month: `${y}-${String(mo).padStart(2, "0")}` })}
        />
      )}
    </>
  );
}

async function ListView({ member }: { member?: MemberSlug | "group" }) {
  const { upcoming, past } = await getSchedule(member);
  return (
    <>
      <ScheduleList events={upcoming} />
      {past.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-ink-soft">지난 일정 보기</summary>
          <div className="mt-3 opacity-70">
            <ScheduleList events={past} />
          </div>
        </details>
      )}
    </>
  );
}
