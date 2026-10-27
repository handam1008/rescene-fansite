import type { Metadata } from "next";
import Link from "next/link";
import ScheduleList from "@/components/ScheduleList";
import { PageHeader } from "@/components/ui";
import { getMember, members, type MemberSlug } from "@/data/members";
import { getSchedule } from "@/lib/schedule";

export const metadata: Metadata = { title: "일정" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  const { member } = await searchParams;
  const selected: MemberSlug | "group" | undefined =
    member === "group" ? "group" : (getMember(member)?.slug as MemberSlug | undefined);
  const { upcoming, past } = await getSchedule(selected);

  const filters = [
    { label: "전체", href: "/schedule", active: !selected },
    { label: "단체", href: "/schedule?member=group", active: selected === "group" },
    ...members.map((m) => ({ label: m.name, href: `/schedule?member=${m.slug}`, active: selected === m.slug })),
  ];

  return (
    <>
      <PageHeader eyebrow="Schedule" title="일정" description="리센느 단체 일정과 멤버별 일정을 모아봐요." />

      <nav aria-label="멤버별 보기" className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-1.5 whitespace-nowrap">
          {filters.map((f) => (
            <li key={f.label}>
              <Link
                href={f.href}
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
