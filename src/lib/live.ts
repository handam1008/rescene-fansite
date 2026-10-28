import { schedule } from "@/data/schedule";

/**
 * LIVE 공통: 운영자가 넣은 라이브 링크(0014 SQL) + 일정에 live 주소가 적힌 것.
 * 서버·브라우저 양쪽에서 씀 (DB 조회는 각자)
 */
export type LiveItem = {
  id: string;
  title: string;
  url: string;
  startsAt: string;
  endsAt: string;
};

/** 시작 몇 분 전부터 "곧 LIVE" 로 보여줄지 */
export const SOON_MINUTES = 30;
/** 일정에 끝나는 시각이 없으면 시작부터 몇 시간 동안 LIVE 로 볼지 */
const DEFAULT_HOURS = 2;

/** 유튜브 주소에서 영상 ID (watch?v=, youtu.be/, /live/, /shorts/). 아니면 null */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host !== "youtube.com" && host !== "music.youtube.com") return null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = /^\/(live|shorts|embed)\/([\w-]+)/.exec(u.pathname);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

/** src/data/schedule.ts 에서 live 주소가 적힌 일정 */
export function scheduleLives(): LiveItem[] {
  return schedule
    .filter((e) => e.live)
    .map((e) => ({
      id: `schedule-${e.id}`,
      title: e.title,
      url: e.live!,
      startsAt: e.date,
      endsAt: e.endDate ?? new Date(new Date(e.date).getTime() + DEFAULT_HOURS * 3_600_000).toISOString(),
    }));
}

/** 지금 방송 중 / 곧 시작 (now 기준) */
export function splitLive(items: LiveItem[], now: number) {
  const live = items.filter((i) => Date.parse(i.startsAt) <= now && now < Date.parse(i.endsAt));
  const soon = items.filter((i) => {
    const start = Date.parse(i.startsAt);
    return start > now && start - now <= SOON_MINUTES * 60_000;
  });
  const upcoming = items.filter((i) => Date.parse(i.startsAt) > now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return { live, soon, upcoming };
}
