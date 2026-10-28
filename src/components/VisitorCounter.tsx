"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * 화면 맨 위 왼쪽의 "오늘 · 누적" 방문자 수 (0013 SQL).
 * 한 브라우저는 하루(한국 시간)에 한 번만 셈. 오늘 이미 셌으면 숫자만 가져옴
 */
export default function VisitorCounter() {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const key = `rescene-visit-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" })}`;
    let counted = false;
    try {
      counted = localStorage.getItem(key) === "1";
    } catch {
      // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는 숫자만 보여줌
      counted = true;
    }
    let alive = true;
    createClient()
      .rpc(counted ? "visit_stats" : "record_visit")
      .then(({ data, error }) => {
        const row = Array.isArray(data) ? data[0] : null;
        if (!alive || error || !row) return;
        setStats({ today: Number(row.today), total: Number(row.total) });
        if (!counted) {
          try {
            localStorage.setItem(key, "1");
          } catch {}
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // 불러오기 전·실패 시에는 자리만 (줄 높이 유지)
  if (!stats) return <span aria-hidden />;

  return (
    <p className="flex items-center gap-2 tabular-nums" aria-label={`오늘 방문자 ${stats.today}명, 누적 방문자 ${stats.total}명`}>
      <span>
        <span className="font-semibold text-lilac-700">오늘</span> {stats.today.toLocaleString()}
      </span>
      <span aria-hidden className="text-lilac-300">|</span>
      <span>
        <span className="font-semibold text-lilac-700">누적</span> {stats.total.toLocaleString()}
      </span>
    </p>
  );
}
