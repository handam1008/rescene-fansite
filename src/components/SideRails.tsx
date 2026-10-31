import { Suspense } from "react";
import PopularPosts from "@/components/PopularPosts";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import { supporters } from "@/data/supporters";
import { getI18n } from "@/i18n/server";
import { getPopularPosts } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSchedule } from "@/lib/schedule";

/*
 * 넓은 PC 화면(1400px 이상)에서만 보이는 양옆 사이드바. 스크롤해도 따라옴.
 * 본문보다 늦게 불러와도 되도록 Suspense 로 감싸서 본문 표시를 막지 않습니다.
 */

// 사이드바 자체를 sticky 로 (안쪽 상자에 주면 사이드바 높이만큼만 움직일 수 있어서 따라오지 않음)
const railClass = "hidden wide:sticky wide:top-24 wide:block";

async function PopularRail() {
  const posts = isSupabaseConfigured ? await getPopularPosts(5) : [];
  return <PopularPosts posts={posts} compact />;
}

async function ScheduleRail() {
  const { upcoming } = await getSchedule();
  return <UpcomingSchedule events={upcoming.slice(0, 6)} compact />;
}

export async function LeftRail() {
  const { m } = await getI18n();
  return (
    <aside className={railClass} aria-label={m.common.popularAria}>
      <Suspense fallback={null}>
        <PopularRail />
      </Suspense>
      {supporters.length > 0 && (
        <section className="card mt-4 p-4">
          <h2 className="font-bold">{m.common.thanksTitle}</h2>
          <p className="mt-1 text-xs text-ink-soft">{m.common.thanksDesc}</p>
          <ul className="mt-2 divide-y divide-lilac-100">
            {supporters.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-lilac-50">
                  <span className="font-semibold">▶ {s.name}</span>
                  <span className="text-xs text-ink-soft">YouTube ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

export async function RightRail() {
  const { m } = await getI18n();
  return (
    <aside className={railClass} aria-label={m.common.upcomingAria}>
      <Suspense fallback={null}>
        <ScheduleRail />
      </Suspense>
    </aside>
  );
}
