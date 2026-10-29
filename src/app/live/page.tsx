import type { Metadata } from "next";
import { LiveBoard } from "@/components/LiveStatus";
import ScheduleList from "@/components/ScheduleList";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { getSchedule } from "@/lib/schedule";

export const metadata: Metadata = { title: "LIVE" };

// 아래 "다가오는 방송·행사"가 날짜에 따라 바뀌므로 5분마다 다시 생성 (LIVE 여부는 브라우저에서 계산)
export const revalidate = 300;

export default async function LivePage() {
  const { upcoming } = await getSchedule();
  const { m } = await getI18n();
  const shows = upcoming.filter((e) => e.type === "broadcast" || e.type === "event").slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Live"
        title="LIVE"
        description={m.live.pageDesc}
      />
      <LiveBoard />
      {shows.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">{m.live.upcomingShows}</h2>
          <ScheduleList events={shows} />
          <p className="mt-2 text-xs text-ink-soft">{m.live.upcomingNote}</p>
        </section>
      )}
    </>
  );
}
