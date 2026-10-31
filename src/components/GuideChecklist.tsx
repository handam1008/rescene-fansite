"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

export type GuideTask = { id: string; label: string; href: string; external?: boolean };

/**
 * 컴백 응원 가이드의 "오늘 할 일". 체크한 건 이 브라우저에만 저장하고, 날짜(한국 시간)가 바뀌면 새로 시작.
 * 할 일 목록은 서버에서 그날 일정·투표로 만들어서 넘겨줌
 */
export default function GuideChecklist({ tasks, dateKey }: { tasks: GuideTask[]; dateKey: string }) {
  const { m } = useI18n();
  const storageKey = `rescene-guide-${dateKey}`;
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {}
  }, [storageKey]);

  function toggle(id: string, on: boolean) {
    const next = on ? [...new Set([...done, id])] : done.filter((x) => x !== id);
    setDone(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  }

  const count = tasks.filter((t) => done.includes(t.id)).length;
  const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">✅ {m.guide.todayTitle}</h2>
        <span className="text-sm font-semibold text-lilac-700 tabular-nums">{fmt(m.guide.progress, { done: count, total: tasks.length })}</span>
      </div>
      <div className="mt-3 h-2 bg-lilac-100" aria-hidden>
        <div className="h-full bg-lilac-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      {count === tasks.length && tasks.length > 0 && <p className="mt-3 text-sm font-bold text-lilac-700">{m.guide.allDone}</p>}

      <ul className="mt-4 space-y-2">
        {tasks.map((t) => {
          const checked = done.includes(t.id);
          return (
            <li key={t.id} className={`flex items-center gap-3 border-2 px-3 py-2.5 ${checked ? "border-lilac-300 bg-lilac-50" : "border-lilac-100 bg-white"}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(t.id, e.target.checked)}
                aria-label={t.label}
                className="h-5 w-5 shrink-0 accent-lilac-500"
              />
              {t.external ? (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => toggle(t.id, true)}
                  className={`min-w-0 flex-1 text-sm font-semibold hover:underline ${checked ? "text-ink-soft line-through decoration-lilac-300" : ""}`}
                >
                  {t.label} ↗
                </a>
              ) : (
                <Link
                  href={t.href}
                  onClick={() => toggle(t.id, true)}
                  className={`min-w-0 flex-1 text-sm font-semibold hover:underline ${checked ? "text-ink-soft line-through decoration-lilac-300" : ""}`}
                >
                  {t.label} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">{m.guide.todayHint}</p>
    </section>
  );
}
