"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { formatDate } from "@/lib/format";
import { fetchAuthors } from "@/lib/profile-titles";
import { createClient } from "@/lib/supabase/client";
import type { Author } from "@/types";
import TitleBadges from "./TitleBadges";

type Row = { userId: string; name: string; score: number; ms: number; at: string };

/** 퀴즈 배틀 명예의 전당 (0022 SQL): 역대 최고 기록 TOP5. 1등은 크게 */
export default function QuizHallOfFame({ refreshKey = 0, myUserId }: { refreshKey?: number; myUserId?: string | null }) {
  const { m, locale } = useI18n();
  const b = m.battle;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [authors, setAuthors] = useState<Map<string, NonNullable<Author>>>(new Map());

  useEffect(() => {
    let alive = true;
    const client = createClient();
    client
      .rpc("quiz_hall_of_fame", { p_limit: 5 })
      .then(async ({ data, error }) => {
        if (!alive) return;
        const list =
          error || !Array.isArray(data)
            ? []
            : data.map((r) => ({ userId: String(r.user_id), name: String(r.name), score: Number(r.score), ms: Number(r.ms), at: String(r.achieved_at) }));
        setRows(list);
        const map = await fetchAuthors(client, list.map((r) => r.userId));
        if (alive) setAuthors(map);
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  const line = (r: Row) => fmt(b.scoreLine, { score: r.score, sec: (r.ms / 1000).toFixed(1) });
  const [first, ...rest] = rows ?? [];

  return (
    <section className="card overflow-hidden">
      <div className="bg-gradient-to-r from-amber-100 via-lilac-100 to-blush-100 px-5 pt-5 pb-4">
        <h2 className="font-bold">{b.hofTitle}</h2>
        <p className="mt-1 text-xs text-ink-soft">{b.hofDesc}</p>
        {rows === null ? (
          <p className="mt-3 text-sm text-ink-soft">…</p>
        ) : !first ? (
          <p className="mt-3 text-sm text-ink-soft">{b.hofEmpty}</p>
        ) : (
          <div className={`mt-3 border-2 border-amber-400 bg-white/80 px-4 py-3 text-center ${myUserId === first.userId ? "ring-2 ring-lilac-400" : ""}`}>
            <p className="text-2xl">👑</p>
            <p className="text-lg font-extrabold">{first.name}</p>
            {authors.get(first.userId) && (
              <p className="mt-1 flex flex-wrap justify-center gap-1">
                <TitleBadges author={authors.get(first.userId)!} locale={locale} />
              </p>
            )}
            <p className="font-bold tabular-nums">{line(first)}</p>
            <p className="text-xs text-ink-soft">{fmt(b.hofAchieved, { date: formatDate(first.at, locale) })}</p>
          </div>
        )}
      </div>
      {rest.length > 0 && (
        <ol className="divide-y divide-lilac-100 px-5 py-2">
          {rest.map((r, i) => (
            <li key={r.userId} className={`flex items-center gap-3 py-2 text-sm ${myUserId === r.userId ? "bg-lilac-50" : ""}`}>
              <span className="w-6 shrink-0 text-center font-extrabold text-lilac-700">{i + 2}</span>
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 font-semibold">
                {authors.get(r.userId) && <TitleBadges author={authors.get(r.userId)!} locale={locale} />}
                <span className="truncate">{r.name}</span>
              </span>
              <span className="shrink-0 font-bold tabular-nums">{line(r)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
