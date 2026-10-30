import type { Metadata } from "next";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountForm, NicknameForm } from "@/components/AccountForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { members, nameOf } from "@/data/members";
import { getI18n } from "@/i18n/server";
import { safeNext } from "@/lib/auth-providers";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.account.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ setup?: string; next?: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { setup, next } = await searchParams;
  const { locale, m } = await getI18n();
  const [{ data: profile }, { data: favRows }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle(),
    // 0012 SQL 전이면 비어 있음
    supabase.from("favorite_members").select("member_slug"),
  ]);
  const favorites = members.filter((member) => (favRows ?? []).some((r) => r.member_slug === member.slug));
  const provider = String(user.app_metadata.provider ?? "email");
  const nickname: string = profile?.nickname ?? "";
  const needsNickname = setup === "1" || profile?.nickname_set === false;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader eyebrow="Account" title={m.account.title} />

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">{m.account.nickname}</h2>
        {needsNickname && (
          <p className="border border-lilac-500 bg-lilac-50 px-3 py-2 text-sm">
            {m.account.welcomeBefore}
            <b>{m.account.welcomeBold}</b>
            {m.account.welcomeAfter}
          </p>
        )}
        <NicknameForm current={nickname} next={needsNickname ? safeNext(next) : undefined} />
      </section>

      <section className="card space-y-3 p-5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">{m.account.favTitle}</h2>
          <Link href="/members" className="font-semibold text-lilac-700 underline">
            {favorites.length ? m.account.favChange : m.account.favPick}
          </Link>
        </div>
        {favorites.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {favorites.map((member) => (
              <li key={member.slug} className="px-2 py-0.5 font-semibold" style={{ backgroundColor: member.color }}>
                {nameOf(member, locale)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">{m.account.favNone}</p>
        )}
      </section>

      <section className="card p-5 text-sm">
        <h2 className="mb-2 font-bold">{m.account.loginInfo}</h2>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1">
          <dt className="text-ink-soft">{m.account.loginMethod}</dt>
          <dd>{m.account.providers[provider] ?? provider}</dd>
          {user.email && (
            <>
              <dt className="text-ink-soft">{m.account.email}</dt>
              <dd className="break-all">{user.email}</dd>
            </>
          )}
          <dt className="text-ink-soft">{m.account.joined}</dt>
          <dd>{formatFullDateTime(user.created_at)}</dd>
        </dl>
        {provider === "email" && (
          <p className="mt-3">
            <Link href="/account/password" className="text-lilac-700 underline">
              {m.account.changePassword}
            </Link>
          </p>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">{m.account.deleteTitle}</h2>
        <DeleteAccountForm />
      </section>

      <p className="text-center text-xs">
        <Link href="/privacy" className="text-ink-soft underline hover:text-ink">
          {m.account.privacy}
        </Link>
      </p>
    </div>
  );
}
