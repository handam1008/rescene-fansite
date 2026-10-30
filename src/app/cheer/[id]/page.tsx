import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BanNotice from "@/components/BanNotice";
import CheerForm from "@/components/CheerForm";
import CheerNotes from "@/components/CheerNotes";
import ShareButtons from "@/components/ShareButtons";
import { EmptyState, PageHeader } from "@/components/ui";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getPaper, getPaperMessages } from "@/lib/cheer";
import { getCurrentUser } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { m, locale } = await getI18n();
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) return { title: m.cheer.title };
  const title = fmt(m.cheer.paperOf, { name: paper.owner?.nickname ?? m.home.unknownUser });
  const image = `/cheer/${id}/image?lang=${locale}`;
  return {
    title,
    description: m.cheer.shareText,
    openGraph: { title, description: m.cheer.shareText, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export const dynamic = "force-dynamic";

/** 한 사람의 응원 롤링페이퍼: 응원 붙이기 + 붙은 응원들 + 공유 */
export default async function CheerPaperPage({ params }: { params: Params }) {
  const { m } = await getI18n();
  const { id } = await params;
  const [paper, user] = await Promise.all([getPaper(id), getCurrentUser()]);
  if (!paper) notFound();
  const { messages, count } = await getPaperMessages(id);
  const isOwner = user?.id === paper.owner_id;
  const name = paper.owner?.nickname ?? m.home.unknownUser;

  return (
    <div className="space-y-6">
      <div>
        <PageHeader eyebrow="PULSE CHEER" title={fmt(m.cheer.paperOf, { name })} description={fmt(m.cheer.count, { n: count })} />
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          {isOwner && <span className="text-xs font-bold text-lilac-700">{m.cheer.shareMine} →</span>}
          <ShareButtons text={m.cheer.shareText} path={`/cheer/${id}`} />
        </div>
      </div>

      {user?.bannedUntil ? (
        <BanNotice until={user.bannedUntil} reason={user.banReason} />
      ) : user ? (
        <CheerForm paperId={id} />
      ) : (
        <p className="card p-4 text-center text-sm">
          <Link href={`/login?next=/cheer/${id}`} className="font-semibold text-lilac-700 underline">
            {m.cheer.loginToWrite}
          </Link>
        </p>
      )}

      {messages.length === 0 ? (
        <EmptyState>{m.cheer.empty}</EmptyState>
      ) : (
        <CheerNotes messages={messages} canDelete={(c) => Boolean(user && (user.id === c.author_id || isOwner || user.isAdmin))} />
      )}

      {!isOwner && (
        <Link href="/cheer" className="btn block bg-lilac-500 py-3 text-center text-lg font-extrabold text-white hover:bg-lilac-700">
          {m.cheer.makeMine}
        </Link>
      )}
    </div>
  );
}
