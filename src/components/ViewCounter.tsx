"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** 글을 열면 조회수 +1. 같은 브라우저 탭에서 새로고침을 반복해도 한 번만 셉니다. */
export default function ViewCounter({ postId }: { postId: number }) {
  useEffect(() => {
    const key = `viewed-post-${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // 저장소를 못 쓰는 환경이면 그냥 셉니다
    }
    createClient().rpc("increment_post_view", { p_post_id: postId }).then(() => {});
  }, [postId]);

  return null;
}
