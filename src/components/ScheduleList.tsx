import { getMember } from "@/data/members";
import { scheduleTypeLabels, type ScheduleEvent, type ScheduleType } from "@/data/schedule";
import { EmptyState } from "./ui";

const TIME_ZONE = "Asia/Seoul";

export const typeStyle: Record<ScheduleType, string> = {
  release: "bg-lilac-500 text-white",
  broadcast: "bg-sky-dream-200 text-sky-700",
  event: "bg-blush-200 text-ink",
  content: "bg-lilac-100 text-lilac-700",
  birthday: "bg-blush-200 text-ink",
  etc: "bg-gray-100 text-gray-600",
};

function parts(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
}

export function EventRow({ event }: { event: ScheduleEvent }) {
  const start = parts(event.date);
  const end = event.endDate ? parts(event.endDate) : null;
  const multiDay = end && `${end.month}${end.day}` !== `${start.month}${start.day}`;
  const who = (event.members ?? []).map((slug) => getMember(slug)).filter((m) => m !== undefined);
  const when = multiDay ? `${start.month}.${start.day} ~ ${end.month}.${end.day}` : event.allDay ? "" : `${start.hour}:${start.minute}`;
  const meta = [when, event.place].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-4 border-b border-lilac-100 px-4 py-3 last:border-0">
      <div className="w-14 shrink-0 text-center">
        <p className="text-xl leading-tight font-extrabold tabular-nums">{start.day}</p>
        <p className="text-xs text-ink-soft">{start.weekday}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-1.5 py-0.5 text-[11px] font-bold ${typeStyle[event.type]}`}>
            {scheduleTypeLabels[event.type]}
          </span>
          {who.length === 0 ? (
            <span className="border border-lilac-200 px-1.5 py-0.5 text-[11px] font-semibold text-lilac-700">단체</span>
          ) : (
            who.map((m) => (
              <span key={m.slug} className="px-1.5 py-0.5 text-[11px] font-semibold text-ink" style={{ backgroundColor: m.color }}>
                {m.name}
              </span>
            ))
          )}
        </div>
        <p className="mt-1 font-semibold break-keep">{event.title}</p>
        {(meta || event.link) && (
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-soft">
            {meta && <span>{meta}</span>}
            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                자세히 ↗
              </a>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

/** 일정 목록: 달별로 묶어서 보여줍니다 */
export default function ScheduleList({ events, emptyText = "예정된 일정이 없어요." }: { events: ScheduleEvent[]; emptyText?: string }) {
  if (events.length === 0) return <EmptyState>{emptyText}</EmptyState>;

  const months = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const p = parts(e.date);
    const key = `${p.year}년 ${Number(p.month)}월`;
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  return (
    <div className="space-y-5">
      {[...months.entries()].map(([month, list]) => (
        <section key={month}>
          <h3 className="mb-2 text-sm font-bold text-lilac-700">{month}</h3>
          <ul className="card">
            {list.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
