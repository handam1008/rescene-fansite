import { Suspense } from "react";
import PopularPosts from "@/components/PopularPosts";
import UpcomingSchedule from "@/components/UpcomingSchedule";
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

export function LeftRail() {
  return (
    <aside className={railClass} aria-label="인기글">
      <Suspense fallback={null}>
        <PopularRail />
      </Suspense>
    </aside>
  );
}

export function RightRail() {
  return (
    <aside className={railClass} aria-label="다가오는 일정">
      <Suspense fallback={null}>
        <ScheduleRail />
      </Suspense>
    </aside>
  );
}
