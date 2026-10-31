import type { SupabaseClient } from "@supabase/supabase-js";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";
import type { Author } from "@/types";

/** 회원 id 여러 개의 공개 정보(칭호 계산용)를 한 번에 가져옴. 실패하면 빈 맵 */
export async function fetchAuthors(client: SupabaseClient, ids: string[]): Promise<Map<string, NonNullable<Author>>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return new Map();
  const { data } = await client.from("profiles").select(PROFILE_COLUMNS).in("id", unique);
  return new Map(((data ?? []) as unknown as (NonNullable<Author> & { id: string })[]).map((p) => [p.id, p]));
}
