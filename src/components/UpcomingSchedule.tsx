import Link from "next/link";
import { getMember } from "@/data/members";
import type { ScheduleEvent } from "@/data/schedule";
import { MoreLink } from "./ui";

function shortDate(iso: string) {
  const p = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", weekday: "short" })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((acc, x) => ({ ...acc, [x.type]: x.value }), {});
  return `${p.month}.${p.day} (${p.weekday})`;
}

/**
 * 다가오는 일정 몇 개.
 * compact: 넓은 PC 화면 오른쪽 사이드바용 (날짜·멤버 한 줄 + 제목 한 줄)
 */
export default function UpcomingSchedule({ events, compact = false }: { events: ScheduleEvent[]; compact?: boolean }) {
  return (
    <section className={`card ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">📅 다가오는 일정</h2>
        <MoreLink href="/schedule">전체 일정</MoreLink>
      </div>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">예정된 일정이 없어요.</p>
      ) : (
        <ul className="mt-3 divide-y divide-lilac-100">
          {events.map((e) => {
            const who = (e.members ?? []).map((s) => getMember(s)?.name).filter(Boolean);
            return (
              <li key={e.id}>
                {compact ? (
                  <Link href="/schedule" className="block py-2 hover:bg-lilac-50">
                    <span className="flex justify-between gap-2 text-xs">
                      <span className="font-semibold text-lilac-700 tabular-nums">{shortDate(e.date)}</span>
                      <span className="truncate text-ink-soft">{who.length ? who.join(", ") : "단체"}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm">{e.title}</span>
                  </Link>
                ) : (
                  <Link href="/schedule" className="flex items-center gap-3 py-2.5 hover:bg-lilac-50">
                    <span className="w-20 shrink-0 text-xs font-semibold text-lilac-700 tabular-nums">
                      {shortDate(e.date)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{e.title}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{who.length ? who.join(", ") : "단체"}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
