import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberHeader from "@/components/MemberHeader";
import ScheduleList from "@/components/ScheduleList";
import { getMember, members, type MemberSlug } from "@/data/members";
import { getSchedule } from "@/lib/schedule";

// 일정이 날짜에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export function generateStaticParams() {
  return members.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const member = getMember((await params).slug);
  return { title: member ? `${member.name}` : "멤버" };
}

function formatBirthday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const { upcoming } = await getSchedule(member.slug as MemberSlug);
  const profile = [
    { label: "이름", value: `${member.name} (${member.english})` },
    { label: "생일", value: formatBirthday(member.birthday) },
    { label: "국적", value: member.nationality },
    ...(member.note ? [{ label: "포지션", value: member.note }] : []),
  ];

  return (
    <>
      <MemberHeader member={member} active="profile" />

      <div className="grid gap-6 md:grid-cols-5">
        <section className="md:col-span-2">
          <h2 className="mb-2 text-sm font-bold text-lilac-700">프로필</h2>
          <dl className="card divide-y divide-lilac-100 text-sm">
            {profile.map((row) => (
              <div key={row.label} className="flex gap-4 px-4 py-2.5">
                <dt className="w-16 shrink-0 font-semibold text-ink-soft">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-ink-soft">출처: 공개 프로필 (soridata · 나무위키)</p>
        </section>

        <section className="md:col-span-3">
          <h2 className="mb-2 text-sm font-bold text-lilac-700">다가오는 일정 (단체 + {member.name})</h2>
          <ScheduleList events={upcoming.slice(0, 8)} />
        </section>
      </div>
    </>
  );
}
