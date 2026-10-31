"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * 실시간 접속자 (운영자 화면에서만 숫자를 보여줌). Supabase Realtime presence 채널 하나를 탭마다 한 번만 열어 씀.
 * 방문자마다 "지금 보고 있는 페이지 주소"만 알림 (이름·계정·IP 없음). 같은 채널을 두 번 열면 서로 끊기므로 여기서 하나로 관리
 */
// 로컬 테스트 때는 NEXT_PUBLIC_SITE_PRESENCE 로 다른 채널을 써서 실제 사이트 숫자와 섞이지 않게
const CHANNEL = process.env.NEXT_PUBLIC_SITE_PRESENCE || "site-online-v1";

export type OnlinePerson = { path: string; since: number };
type Listener = (people: OnlinePerson[]) => void;

let channel: RealtimeChannel | null = null;
let subscribed = false;
let currentPath = "";
const listeners = new Set<Listener>();
let people: OnlinePerson[] = [];

function emit() {
  listeners.forEach((l) => l(people));
}

function ensureChannel() {
  if (channel) return channel;
  const key = crypto.randomUUID();
  channel = createClient().channel(CHANNEL, { config: { presence: { key } } });
  channel.on("presence", { event: "sync" }, () => {
    const state = channel!.presenceState<OnlinePerson>();
    people = Object.values(state).flatMap((metas) => {
      // 페이지를 옮기면 잠깐 옛 기록과 새 기록이 같이 있어서 가장 최근 것만
      const last = metas.reduce<OnlinePerson | undefined>((a, m) => (!a || (m.since ?? 0) >= (a.since ?? 0) ? m : a), undefined);
      return last ? [{ path: String(last.path ?? "/"), since: Number(last.since) || 0 }] : [];
    });
    emit();
  });
  channel.subscribe((s) => {
    if (s === "SUBSCRIBED") {
      subscribed = true;
      if (currentPath) void channel!.track({ path: currentPath, since: Date.now() });
    }
  });
  return channel;
}

/** 방문자: 지금 보는 페이지를 알림 (페이지를 옮길 때마다 부름) */
export function trackPage(path: string) {
  currentPath = path;
  const ch = ensureChannel();
  if (subscribed) void ch.track({ path, since: Date.now() });
}

/** 운영자: 접속자 목록이 바뀔 때마다 받음. 돌려주는 함수로 그만 받기 */
export function subscribeOnline(listener: Listener) {
  ensureChannel();
  listeners.add(listener);
  listener(people);
  return () => {
    listeners.delete(listener);
  };
}
