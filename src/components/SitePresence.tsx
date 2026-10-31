"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPage } from "@/lib/site-presence";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** 모든 페이지: 지금 보고 있는 페이지 주소를 실시간 접속자 채널에 알림 (화면에는 아무것도 안 그림) */
export default function SitePresence() {
  const pathname = usePathname();
  useEffect(() => {
    if (isSupabaseConfigured) trackPage(pathname || "/");
  }, [pathname]);
  return null;
}
