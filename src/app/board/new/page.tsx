import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/BoardForms";
import BanNotice from "@/components/BanNotice";
import { BoardRulesSummary } from "@/components/BoardRules";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { getMember, nameOf } from "@/data/members";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.board.writePost };
}

// 로그인 상태·최신 글을 매번 새로 불러옴
export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const { locale, m } = await getI18n();
  const member = getMember((await searchParams).member);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(member ? `/board/new?member=${member.slug}` : "/board/new")}`);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Board" title={member ? fmt(m.board.memberBoard, { name: nameOf(member, locale) }) : m.board.title} />
      {user.bannedUntil ? (
        <BanNotice until={user.bannedUntil} reason={user.banReason} />
      ) : (
        <>
          <BoardRulesSummary />
          <PostForm userId={user.id} defaultMember={member?.slug} />
        </>
      )}
    </div>
  );
}
