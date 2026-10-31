"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { createClient } from "@/lib/supabase/client";

type Row = { userId: string; name: string; score: number; ms: number; wins: number };

/** 퀴즈 배틀 이번 주 랭킹 (0019·0020 SQL, 회원만). refreshKey 가 바뀌면 다시 불러옴 (내 기록을 남긴 뒤) */
export default function QuizLeaderboard({ refreshKey = 0, myUserId }: { refreshKey?: number; myUserId?: string | null }) {
  const { m } = useI18n();
  const b = m.battle;
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    createClient()
      .rpc("quiz_leaderboard", { p_limit: 10 })
      .then(({ data, error }) => {
        if (!alive) return;
        setRows(error || !Array.isArray(data) ? [] : data.map((r) => ({ userId: String(r.user_id), name: String(r.name), score: Number(r.score), ms: Number(r.ms), wins: Number(r.wins) })));
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  const medal = ["🥇", "🥈", "🥉"];
  return (
    <section className="card p-5">
      <h2 className="font-bold">{b.lbTitle}</h2>
      {rows === null ? (
        <p className="mt-3 text-sm text-ink-soft">…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{b.lbEmpty}</p>
      ) : (
        <ol className="mt-3 divide-y divide-lilac-100">
          {rows.map((r, i) => (
            <li key={r.userId} className={`flex items-center gap-3 py-2 text-sm ${myUserId && r.userId === myUserId ? "bg-lilac-50" : ""}`}>
              <span className="w-7 shrink-0 text-center font-extrabold text-lilac-700 tabular-nums">{medal[i] ?? i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {r.name}
                {myUserId && r.userId === myUserId && <span className="ml-1 text-xs text-lilac-700">({b.lbMine})</span>}
              </span>
              {r.wins > 0 && <span className="shrink-0 text-xs text-ink-soft">{fmt(b.lbWins, { n: r.wins })}</span>}
              <span className="shrink-0 font-bold tabular-nums">{fmt(b.scoreLine, { score: r.score, sec: (r.ms / 1000).toFixed(1) })}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-xs text-ink-soft">{b.lbHint}</p>
      <p className="mt-1 text-xs text-ink-soft">{b.lbTitles}</p>
    </section>
  );
}
