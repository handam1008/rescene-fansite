import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.notice.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type NotificationRow = {
  id: number;
  type: "comment";
  post_id: number | null;
  created_at: string;
  read_at: string | null;
  post: { title: string } | null;
  actor: { nickname: string } | null;
};

/** 내 글에 달린 댓글 알림. 이 화면을 열면 모두 읽음으로 바뀜 */
export default async function NotificationsPage() {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const { data } = await supabase
    .from("notifications")
    // 알림에는 회원(profiles)으로 가는 연결이 둘(받는 사람·댓글 쓴 사람)이라 어느 쪽인지 지정
    .select("id, type, post_id, created_at, read_at, post:posts(title), actor:profiles!notifications_actor_id_fkey(nickname)")
    .order("created_at", { ascending: false })
    .limit(50);
  const items = (data ?? []) as unknown as NotificationRow[];
  const { m } = await getI18n();

  if (items.some((n) => !n.read_at)) {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Notice" title={m.notice.title} description={m.notice.desc} />
      {items.length === 0 ? (
        <EmptyState>{m.notice.empty}</EmptyState>
      ) : (
        <ul className="card divide-y divide-lilac-100">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.post_id ? `/board/${n.post_id}` : "/board"}
                className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-lilac-50 ${n.read_at ? "" : "bg-lilac-50"}`}
              >
                <span aria-hidden>💬</span>
                <span className="min-w-0 flex-1">
                  <b>{n.actor?.nickname ?? m.notice.someone}</b>
                  {m.notice.commentMid}
                  <b className="text-lilac-700">{fmt(m.notice.commentQuote, { t: n.post?.title ?? m.notice.deletedPost })}</b>
                  {m.notice.commentEnd}
                  <span className="mt-0.5 block text-xs text-ink-soft">{formatFullDateTime(n.created_at)}</span>
                </span>
                {!n.read_at && <span className="shrink-0 bg-blush-400 px-1.5 text-[10px] leading-4 font-bold text-white">NEW</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
