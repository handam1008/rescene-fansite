import { createPublicClient } from "@/lib/supabase/public";

/** 컴백 응원 롤링페이퍼 (0016). 응원은 리센느에게 보내는 공개 메시지라 로그인 없이 읽음 */

export type CheerMessage = {
  id: number;
  paper_id: string;
  author_id: string;
  member: string | null;
  content: string;
  created_at: string;
  author: { nickname: string; is_admin?: boolean } | null;
};

export type CheerPaper = { id: string; owner_id: string; owner: { nickname: string } | null };

const MESSAGE_COLUMNS = "id, paper_id, author_id, member, content, created_at, author:profiles(nickname, is_admin)";

/** 지금까지 붙은 응원 수 (0016 SQL 전이면 0) */
export async function getCheerTotal() {
  const { count } = await createPublicClient().from("cheer_messages").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getPaper(id: string): Promise<CheerPaper | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await createPublicClient().from("cheer_papers").select("id, owner_id, owner:profiles(nickname)").eq("id", id).maybeSingle();
  return (data as unknown as CheerPaper) ?? null;
}

export async function getPaperMessages(paperId: string) {
  const { data, count } = await createPublicClient()
    .from("cheer_messages")
    .select(MESSAGE_COLUMNS, { count: "exact" })
    .eq("paper_id", paperId)
    .order("created_at", { ascending: false })
    .limit(300);
  return { messages: (data ?? []) as unknown as CheerMessage[], count: count ?? 0 };
}

export async function getRecentCheers(limit = 12) {
  const { data } = await createPublicClient().from("cheer_messages").select(MESSAGE_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as unknown as CheerMessage[];
}
