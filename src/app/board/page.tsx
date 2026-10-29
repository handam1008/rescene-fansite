import type { Metadata } from "next";
import BoardList from "@/components/BoardList";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { cleanSearch, getPosts, type BoardTab } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.board.title };
}

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string; q?: string }>;
}) {
  const { m } = await getI18n();
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader eyebrow="Board" title={m.board.title} />
        <SupabaseNotice />
      </>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const tab: BoardTab = params.tab === "best" ? "best" : "all";
  const q = cleanSearch(params.q);
  const [{ posts, total }, user] = await Promise.all([getPosts(page, tab, undefined, q), getCurrentUser()]);

  return (
    <>
      <PageHeader eyebrow="Board" title={m.board.title} description={m.board.desc} />
      <BoardList
        posts={posts}
        total={total}
        page={page}
        tab={tab}
        writeHref={user ? "/board/new" : "/login?next=/board/new"}
        q={q}
      />
    </>
  );
}
