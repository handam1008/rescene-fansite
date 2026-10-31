"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeOnline, type OnlinePerson } from "@/lib/site-presence";

/** 운영자 전용 실시간 접속자. compact 면 헤더용 작은 배지, 아니면 페이지별 인원까지 */
export default function AdminOnlineCount({ compact = false }: { compact?: boolean }) {
  const [people, setPeople] = useState<OnlinePerson[] | null>(null);
  useEffect(() => subscribeOnline(setPeople), []);

  if (compact) {
    return (
      <Link
        href="/admin"
        title="지금 사이트를 보고 있는 사람 (나 포함, 운영자에게만 보여요)"
        className="flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 tabular-nums"
      >
        <span className="inline-block h-1.5 w-1.5 animate-pulse bg-emerald-500" aria-hidden />
        {people === null ? "…" : people.length}
      </Link>
    );
  }

  const byPath = new Map<string, number>();
  (people ?? []).forEach((p) => {
    // /board/123 같은 글 번호는 "/board/글" 로 묶음
    const key = p.path.replace(/\/\d+(?=\/|$)/g, "/글");
    byPath.set(key, (byPath.get(key) ?? 0) + 1);
  });
  const rows = [...byPath.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">🟢 지금 접속 중</h2>
        <span className="text-2xl font-extrabold text-emerald-700 tabular-nums">{people === null ? "…" : `${people.length}명`}</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        지금 사이트를 열어 둔 화면 수예요(나 포함, 탭마다 1명). 페이지를 닫으면 몇 초 안에 빠져요. 운영자에게만 보여요.
      </p>
      {rows.length > 0 && (
        <ul className="mt-3 divide-y divide-lilac-100 text-sm">
          {rows.map(([path, n]) => (
            <li key={path} className="flex justify-between gap-3 py-1.5">
              <span className="truncate text-ink-soft">{path}</span>
              <span className="shrink-0 font-bold tabular-nums">{n}명</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
