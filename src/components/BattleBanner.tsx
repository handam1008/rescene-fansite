"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { BATTLE_LOBBY, latestMeta } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";

/**
 * 홈 화면 큰 배너: 퀴즈 배틀 대기실을 엿봐서 "지금 n명 대기 중"을 실시간으로 보여줌.
 * 보기만 하고 자기는 대기실 인원에 넣지 않음 (track 안 함)
 */
export default function BattleBanner() {
  const { m } = useI18n();
  const [waiting, setWaiting] = useState<number | null>(null);

  useEffect(() => {
    const client = createClient();
    const ch = client.channel(BATTLE_LOBBY);
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<{ state?: string; since?: number }>();
      setWaiting(Object.values(state).filter((metas) => latestMeta(metas)?.state === "waiting").length);
    });
    ch.subscribe();
    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const b = m.battle;
  return (
    <Link
      href="/battle"
      className="group relative block overflow-hidden border-2 border-lilac-400 bg-gradient-to-br from-lilac-500 via-lilac-400 to-blush-400 p-5 text-white shadow-lg shadow-lilac-200/60 sm:p-6"
    >
      <span aria-hidden className="absolute -top-6 -right-4 text-8xl opacity-20 transition-transform group-hover:rotate-12">⚔️</span>
      <span className="relative block text-xl font-extrabold sm:text-2xl">{b.homeLink}</span>
      <span className="relative mt-1 block text-sm text-white/90">{b.bannerDesc}</span>
      <span className="relative mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          {waiting !== null && waiting > 0 && <span className="inline-block h-2.5 w-2.5 animate-pulse bg-white" aria-hidden />}
          {waiting !== null && waiting > 0 ? fmt(b.bannerWaiting, { n: waiting }) : b.bannerNone}
        </span>
        <span className="bg-white px-4 py-2 text-sm font-extrabold text-lilac-700 transition-transform group-hover:translate-x-0.5">
          {b.bannerCta} →
        </span>
      </span>
    </Link>
  );
}
