import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountForm, NicknameForm } from "@/components/AccountForms";
import { PageHeader, SupabaseNotice } from "@/components/ui";
import { members } from "@/data/members";
import { safeNext } from "@/lib/auth-providers";
import { formatFullDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "내 정보", robots: { index: false } };

export const dynamic = "force-dynamic";

const providerNames: Record<string, string> = { email: "이메일", google: "구글", kakao: "카카오" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ setup?: string; next?: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { setup, next } = await searchParams;
  const [{ data: profile }, { data: favRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    // 0012 SQL 전이면 비어 있음
    supabase.from("favorite_members").select("member_slug"),
  ]);
  const favorites = members.filter((m) => (favRows ?? []).some((r) => r.member_slug === m.slug));
  const provider = String(user.app_metadata.provider ?? "email");
  const nickname: string = profile?.nickname ?? "";
  const needsNickname = setup === "1" || profile?.nickname_set === false;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader eyebrow="Account" title="내 정보" />

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">닉네임</h2>
        {needsNickname && (
          <p className="border border-lilac-500 bg-lilac-50 px-3 py-2 text-sm">
            👋 환영해요! 게시판과 도감에서 쓸 <b>닉네임</b>을 정해주세요.
          </p>
        )}
        <NicknameForm current={nickname} next={needsNickname ? safeNext(next) : undefined} />
      </section>

      <section className="card space-y-3 p-5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">💜 최애 멤버</h2>
          <Link href="/members" className="font-semibold text-lilac-700 underline">
            {favorites.length ? "최애 바꾸기" : "최애 고르기"}
          </Link>
        </div>
        {favorites.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {favorites.map((m) => (
              <li key={m.slug} className="px-2 py-0.5 font-semibold" style={{ backgroundColor: m.color }}>
                {m.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">아직 고른 최애가 없어요. 여러 명도 고를 수 있어요.</p>
        )}
      </section>

      <section className="card p-5 text-sm">
        <h2 className="mb-2 font-bold">로그인 정보</h2>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1">
          <dt className="text-ink-soft">로그인 방식</dt>
          <dd>{providerNames[provider] ?? provider}</dd>
          {user.email && (
            <>
              <dt className="text-ink-soft">이메일</dt>
              <dd className="break-all">{user.email}</dd>
            </>
          )}
          <dt className="text-ink-soft">가입일</dt>
          <dd>{formatFullDateTime(user.created_at)}</dd>
        </dl>
        {provider === "email" && (
          <p className="mt-3">
            <Link href="/account/password" className="text-lilac-700 underline">
              비밀번호 바꾸기
            </Link>
          </p>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">회원 탈퇴</h2>
        <DeleteAccountForm />
      </section>

      <p className="text-center text-xs">
        <Link href="/privacy" className="text-ink-soft underline hover:text-ink">
          개인정보처리방침
        </Link>
      </p>
    </div>
  );
}
