import type { Metadata } from "next";
import Link from "next/link";
import CheerNotes from "@/components/CheerNotes";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCheerTotal, getRecentCheers } from "@/lib/cheer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createPaper } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.cheer.title, description: m.cheer.desc };
}

export const dynamic = "force-dynamic";

/** 컴백 응원 롤링페이퍼 첫 화면: 모인 응원 수, 내 롤링페이퍼 만들기, 방금 붙은 응원 */
export default async function CheerHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { m } = await getI18n();
  const header = <PageHeader eyebrow="PULSE CHEER" title={m.cheer.title} description={m.cheer.desc} />;
  if (!isSupabaseConfigured) {
    return (
      <>
        {header}
        <SupabaseNotice />
      </>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [total, recent, mine, { error }] = await Promise.all([
    getCheerTotal(),
    getRecentCheers(12),
    user ? supabase.from("cheer_papers").select("id").eq("owner_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    searchParams,
  ]);

  return (
    <div className="space-y-8">
      <div>
        {header}
        <div className="card flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-2xl font-extrabold text-lilac-700">💌 {fmt(m.cheer.total, { n: total })}</p>
          {mine.data ? (
            <Link href={`/cheer/${mine.data.id}`} className="btn bg-lilac-500 px-6 py-3 text-lg font-extrabold text-white hover:bg-lilac-700">
              {m.cheer.mine}
            </Link>
          ) : user ? (
            <form action={createPaper}>
              <button type="submit" className="btn bg-lilac-500 px-6 py-3 text-lg font-extrabold text-white hover:bg-lilac-700">
                {m.cheer.create}
              </button>
            </form>
          ) : (
            <Link href="/login?next=/cheer" className="btn bg-lilac-500 px-6 py-3 text-lg font-extrabold text-white hover:bg-lilac-700">
              {m.cheer.create}
            </Link>
          )}
          {!user && <p className="text-xs text-ink-soft">{m.cheer.loginToCreate}</p>}
          {error && <p className="text-sm text-red-600">{m.cheer.errCreate}</p>}
        </div>
      </div>

      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">{m.cheer.recent}</h2>
        {recent.length === 0 ? <EmptyState>{m.cheer.empty}</EmptyState> : <CheerNotes messages={recent} showPaperLink />}
      </section>
    </div>
  );
}
