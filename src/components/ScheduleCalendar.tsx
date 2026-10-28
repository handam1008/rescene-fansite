import Link from "next/link";
import { scheduleTypeLabels, type ScheduleEvent, type ScheduleType } from "@/data/schedule";
import { kstDateKey } from "@/lib/schedule";
import { EventRow, typeStyle } from "./ScheduleList";
import { EmptyState } from "./ui";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 달력 칸의 작은 점 색 (휴대폰) */
const dotStyle: Record<ScheduleType, string> = {
  release: "bg-lilac-500",
  broadcast: "bg-sky-700",
  event: "bg-blush-400",
  content: "bg-lilac-300",
  birthday: "bg-amber-400",
  etc: "bg-gray-400",
};

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/**
 * 월 달력. 넓은 화면은 칸 안에 일정 제목, 휴대폰은 색 점으로 보여주고,
 * 아래에 그 달 일정을 날짜별로 자세히 보여줌 (칸을 누르면 그 날짜로 이동)
 */
export default function ScheduleCalendar({
  year,
  month,
  events,
  hrefFor,
}: {
  year: number;
  /** 1~12 */
  month: number;
  events: ScheduleEvent[];
  /** 다른 달로 가는 주소 */
  hrefFor: (year: number, month: number) => string;
}) {
  const today = kstDateKey(new Date());
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const firstKey = keyOf(year, month, 1);

  // 날짜별 일정 (여러 날 일정은 걸친 날마다)
  const byDay = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const start = kstDateKey(e.date);
    const end = kstDateKey(e.endDate ?? e.date);
    for (let d = 1; d <= daysInMonth; d++) {
      const k = keyOf(year, month, d);
      if (k >= start && k <= end) byDay.set(k, [...(byDay.get(k) ?? []), e]);
    }
  }

  // 아래 목록: 시작일(이번 달 이전에 시작했으면 1일)에 한 번만
  const agenda = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const k = kstDateKey(e.date) < firstKey ? firstKey : kstDateKey(e.date);
    agenda.set(k, [...(agenda.get(k) ?? []), e]);
  }

  const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={hrefFor(prev[0], prev[1])} className="btn border border-lilac-200 bg-white px-3 py-1.5 text-sm" aria-label="이전 달">
          ‹ {prev[1]}월
        </Link>
        <h2 className="text-xl font-extrabold tabular-nums">
          {year}년 {month}월
        </h2>
        <Link href={hrefFor(next[0], next[1])} className="btn border border-lilac-200 bg-white px-3 py-1.5 text-sm" aria-label="다음 달">
          {next[1]}월 ›
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-lilac-200 bg-lilac-50 text-center text-xs font-semibold">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-sky-700" : "text-ink-soft"}`}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} className="min-h-14 border-r border-b border-lilac-100 bg-lilac-50/40 sm:min-h-24" />;
            const k = keyOf(year, month, day);
            const list = byDay.get(k) ?? [];
            const isToday = k === today;
            const weekday = i % 7;
            const inner = (
              <>
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center text-xs font-bold tabular-nums ${
                    isToday ? "bg-lilac-500 text-white" : weekday === 0 ? "text-red-500" : weekday === 6 ? "text-sky-700" : ""
                  }`}
                >
                  {day}
                </span>
                {/* 휴대폰: 색 점 */}
                {list.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {list.slice(0, 4).map((e) =>
                      e.important ? (
                        <span key={e.id} className="text-[9px] leading-none text-amber-500">★</span>
                      ) : (
                        <span key={e.id} className={`h-1.5 w-1.5 ${e.tentative ? "border border-dashed border-ink-soft bg-transparent" : dotStyle[e.type]}`} />
                      ),
                    )}
                  </span>
                )}
                {/* 넓은 화면: 제목 */}
                <span className="mt-1 hidden space-y-0.5 sm:block">
                  {list.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`block truncate px-1 text-[11px] leading-4 ${
                        e.tentative ? "border border-dashed border-lilac-300 bg-white text-ink-soft" : typeStyle[e.type]
                      } ${e.important ? "font-bold ring-1 ring-amber-400" : ""}`}
                      title={`${e.title}${e.tentative ? " (미확정)" : ""}`}
                    >
                      {e.important && "★ "}
                      {e.tentative && "? "}
                      {e.title}
                    </span>
                  ))}
                  {list.length > 3 && <span className="block text-[11px] text-ink-soft">+{list.length - 3}개</span>}
                </span>
              </>
            );
            const cellClass = `block min-h-14 border-r border-b border-lilac-100 p-1 align-top sm:min-h-24 ${
              (i + 1) % 7 === 0 ? "border-r-0" : ""
            } ${isToday ? "bg-lilac-50" : "bg-white"}`;
            return list.length > 0 ? (
              <a key={k} href={`#d-${k}`} className={`${cellClass} hover:bg-lilac-100`} aria-label={`${month}월 ${day}일 일정 ${list.length}개`}>
                {inner}
              </a>
            ) : (
              <div key={k} className={cellClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft" aria-label="일정 종류">
        {(Object.keys(scheduleTypeLabels) as ScheduleType[]).map((t) => (
          <li key={t} className="flex items-center gap-1">
            <span className={`h-2 w-2 ${dotStyle[t]}`} />
            {scheduleTypeLabels[t]}
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span className="text-amber-500">★</span>중요 (컴백 등)
        </li>
        <li className="flex items-center gap-1">
          <span className="h-2 w-2 border border-dashed border-ink-soft" />
          미확정 (예상)
        </li>
      </ul>

      {agenda.size === 0 ? (
        <EmptyState>이 달에는 일정이 없어요.</EmptyState>
      ) : (
        <div className="space-y-4">
          {[...agenda.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, list]) => {
              const d = new Date(`${k}T00:00:00+09:00`);
              const label = d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" });
              return (
                <section key={k} id={`d-${k}`} className="scroll-mt-32 xl:scroll-mt-24">
                  <h3 className={`mb-1.5 text-sm font-bold ${k === today ? "text-lilac-700" : ""}`}>
                    {label}
                    {k === today && <span className="ml-1.5 bg-lilac-500 px-1 text-[10px] text-white">오늘</span>}
                  </h3>
                  <ul className="card">
                    {list.map((e) => (
                      <EventRow key={e.id} event={e} />
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
