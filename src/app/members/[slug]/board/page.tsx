import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import MemberHeader from "@/components/MemberHeader";
import { SupabaseNotice } from "@/components/ui";
import { getMember, nameOf } from "@/data/members";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { cleanSearch, getPosts, type BoardTab } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const member = getMember((await params).slug);
  const { m, locale } = await getI18n();
  return { title: member ? fmt(m.members.tabBoard, { name: nameOf(member, locale) }) : m.nav.board };
}

export default async function MemberBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; tab?: string; q?: string }>;
}) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const tab: BoardTab = query.tab === "best" ? "best" : "all";

  if (!isSupabaseConfigured) {
    return (
      <>
        <MemberHeader member={member} active="board" />
        <SupabaseNotice />
      </>
    );
  }

  const q = cleanSearch(query.q);
  const [{ posts, total, notices }, user] = await Promise.all([getPosts(page, tab, member.slug, q), getCurrentUser()]);
  const newPath = `/board/new?member=${member.slug}`;

  return (
    <>
      <MemberHeader member={member} active="board" />
      <BoardList
        posts={posts}
        notices={notices}
        total={total}
        page={page}
        tab={tab}
        writeHref={user ? newPath : `/login?next=${encodeURIComponent(newPath)}`}
        basePath={`/members/${member.slug}/board`}
        showMember={false}
        q={q}
      />
    </>
  );
}
