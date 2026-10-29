"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(target: number, now: number): Parts | null {
  const diff = target - now;
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * 컴백까지 남은 시간 카운트다운.
 * 서버 렌더링 시점과 브라우저 시간이 달라 생기는 불일치를 막기 위해
 * 브라우저에서 마운트된 뒤에만 숫자를 표시합니다.
 */
export default function Countdown({
  target,
  compact = false,
}: {
  /** ISO 8601 일시 */
  target: string;
  compact?: boolean;
}) {
  const { m } = useI18n();
  const targetTime = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = now === null ? undefined : partsUntil(targetTime, now);

  if (parts === null) {
    return (
      <p className={`font-extrabold text-dreamy ${compact ? "text-lg" : "text-3xl"}`}>
        {m.countdown.done}
      </p>
    );
  }

  const dLabel = parts ? (parts.days === 0 ? "D-DAY" : `D-${parts.days}`) : "D-…";

  const units: [string, number | undefined][] = [
    [m.countdown.days, parts?.days],
    [m.countdown.hours, parts?.hours],
    [m.countdown.minutes, parts?.minutes],
    [m.countdown.seconds, parts?.seconds],
  ];
  const pad = (value: number | undefined) => (value === undefined ? "--" : String(value).padStart(2, "0"));

  // 홈 카드용: D-day 와 작은 남은 시간 칸
  if (compact) {
    return (
      <div>
        <p className="text-dreamy text-3xl font-extrabold">{dLabel}</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5" aria-live="off">
          {units.map(([label, value]) => (
            <div key={label} className="bg-lilac-50 py-1.5 text-center">
              <p className="text-base font-bold tabular-nums">{pad(value)}</p>
              <p className="text-[10px] text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-dreamy text-5xl font-extrabold sm:text-6xl">{dLabel}</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3" aria-live="off">
        {units.map(([label, value]) => (
          <div key={label} className="bg-white px-2 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums sm:text-3xl">{pad(value)}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
