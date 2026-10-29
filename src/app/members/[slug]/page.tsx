import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberHeader from "@/components/MemberHeader";
import ScheduleList from "@/components/ScheduleList";
import { getMember, members, nameOf, nationalityOf, noteOf, type MemberSlug } from "@/data/members";
import { fmt, INTL_LOCALE, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getSchedule } from "@/lib/schedule";

// 일정이 날짜에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export function generateStaticParams() {
  return members.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const member = getMember((await params).slug);
  const { m, locale } = await getI18n();
  return { title: member ? nameOf(member, locale) : m.members.memberFallback };
}

/** "2004-05-25" → "2004년 5월 25일" / "2004年5月25日" / "May 25, 2004" */
function formatBirthday(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const { upcoming } = await getSchedule(member.slug as MemberSlug);
  const { m, locale } = await getI18n();
  const name = nameOf(member, locale);
  const profile = [
    { label: m.members.name, value: locale === "ko" ? `${member.name} (${member.english})` : `${name} (${member.name})` },
    { label: m.members.birthday, value: formatBirthday(member.birthday, locale) },
    { label: m.members.nationality, value: nationalityOf(member, locale) },
    ...(member.note ? [{ label: m.members.position, value: noteOf(member, locale) }] : []),
  ];

  return (
    <>
      <MemberHeader member={member} active="profile" />

      <div className="grid gap-6 md:grid-cols-5">
        <section className="md:col-span-2">
          <h2 className="mb-2 text-sm font-bold text-lilac-700">{m.members.profile}</h2>
          <dl className="card divide-y divide-lilac-100 text-sm">
            {profile.map((row) => (
              <div key={row.label} className="flex gap-4 px-4 py-2.5">
                <dt className="w-16 shrink-0 font-semibold text-ink-soft">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-ink-soft">{m.members.source}</p>
        </section>

        <section className="md:col-span-3">
          <h2 className="mb-2 text-sm font-bold text-lilac-700">{fmt(m.members.upcoming, { name })}</h2>
          <ScheduleList events={upcoming.slice(0, 8)} />
        </section>
      </div>
    </>
  );
}
