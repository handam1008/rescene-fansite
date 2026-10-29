import { getMember, nameOf } from "@/data/members";
import type { ScheduleEvent, ScheduleType } from "@/data/schedule";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { getI18n } from "@/i18n/server";
import { formatMonthYear } from "@/lib/format";
import { eventPlace, eventTitle } from "@/lib/schedule";
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

function parts(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
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

/** 일정 한 줄. 문구·언어는 목록(ScheduleList)·달력(ScheduleCalendar)에서 받음 */
export function EventRow({ event, locale, m }: { event: ScheduleEvent; locale: Locale; m: Messages }) {
  const start = parts(event.date, locale);
  const end = event.endDate ? parts(event.endDate, locale) : null;
  const multiDay = end && `${end.month}${end.day}` !== `${start.month}${start.day}`;
  const who = (event.members ?? []).map((slug) => getMember(slug)).filter((m) => m !== undefined);
  const when = multiDay ? `${start.month}.${start.day} ~ ${end.month}.${end.day}` : event.allDay ? "" : `${start.hour}:${start.minute}`;
  const meta = [when, eventPlace(event, locale)].filter(Boolean).join(" · ");

  return (
    <li
      className={`flex gap-4 border-b border-lilac-100 px-4 py-3 last:border-0 ${
        event.tentative ? "bg-lilac-50/50 opacity-80" : event.important ? "bg-amber-50/60" : ""
      }`}
    >
      <div className="w-14 shrink-0 text-center">
        <p className="text-xl leading-tight font-extrabold tabular-nums">{start.day}</p>
        <p className="text-xs text-ink-soft">{start.weekday}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {event.important && <span className="bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold text-white">{m.schedule.important}</span>}
          {event.tentative && (
            <span className="border border-dashed border-ink-soft px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
              {m.schedule.tentative}
            </span>
          )}
          <span className={`px-1.5 py-0.5 text-[11px] font-bold ${typeStyle[event.type]}`}>
            {m.schedule.types[event.type]}
          </span>
          {who.length === 0 ? (
            <span className="border border-lilac-200 px-1.5 py-0.5 text-[11px] font-semibold text-lilac-700">{m.schedule.group}</span>
          ) : (
            who.map((mem) => (
              <span key={mem.slug} className="px-1.5 py-0.5 text-[11px] font-semibold text-ink" style={{ backgroundColor: mem.color }}>
                {nameOf(mem, locale)}
              </span>
            ))
          )}
        </div>
        <p className="mt-1 font-semibold break-keep">
          {event.important && <span className="mr-1 text-amber-500">★</span>}
          {eventTitle(event, locale)}
        </p>
        {(meta || event.link) && (
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-soft">
            {meta && <span>{meta}</span>}
            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                {m.schedule.details}
              </a>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

/** 일정 목록: 달별로 묶어서 보여줍니다 */
export default async function ScheduleList({ events, emptyText }: { events: ScheduleEvent[]; emptyText?: string }) {
  const { m, locale } = await getI18n();
  if (events.length === 0) return <EmptyState>{emptyText ?? m.schedule.empty}</EmptyState>;

  const months = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const p = parts(e.date, "ko");
    const key = formatMonthYear(Number(p.year), Number(p.month), locale);
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  return (
    <div className="space-y-5">
      {[...months.entries()].map(([month, list]) => (
        <section key={month}>
          <h3 className="mb-2 text-sm font-bold text-lilac-700">{month}</h3>
          <ul className="card">
            {list.map((e) => (
              <EventRow key={e.id} event={e} locale={locale} m={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
