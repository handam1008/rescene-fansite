import type { Metadata } from "next";
import { LiveBoard } from "@/components/LiveStatus";
import ScheduleList from "@/components/ScheduleList";
import { PageHeader } from "@/components/ui";
import { getSchedule } from "@/lib/schedule";

export const metadata: Metadata = { title: "LIVE" };

// 아래 "다가오는 방송·행사"가 날짜에 따라 바뀌므로 5분마다 다시 생성 (LIVE 여부는 브라우저에서 계산)
export const revalidate = 300;

export default async function LivePage() {
  const { upcoming } = await getSchedule();
  const shows = upcoming.filter((e) => e.type === "broadcast" || e.type === "event").slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Live"
        title="LIVE"
        description="리센느가 출연하는 방송·공연, 안원잘부 최초 공개를 여기서 바로 봐요. 라이브가 시작되면 사이트 위쪽에 빨간 LIVE 줄이 떠요."
      />
      <LiveBoard />
      {shows.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">다가오는 방송·행사</h2>
          <ScheduleList events={shows} />
          <p className="mt-2 text-xs text-ink-soft">라이브 주소가 나오면 시작 시각에 맞춰 위쪽에 LIVE 로 알려드려요.</p>
        </section>
      )}
    </>
  );
}
