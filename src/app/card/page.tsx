import type { Metadata } from "next";
import Link from "next/link";
import CardBuilder from "@/components/CardBuilder";
import { PageHeader } from "@/components/ui";
import type { MemberSlug } from "@/data/members";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { cardQuery, getCardData, hasCard, parseCardParams } from "@/lib/remine-card";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Search = Promise<Record<string, string | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { m, locale } = await getI18n();
  const sp = await searchParams;
  const p = parseCardParams((k) => sp[k]);
  if (!hasCard(p)) return { title: m.card.title, description: m.card.desc };
  const card = await getCardData(p, locale);
  const title = fmt(m.card.friendCard, { name: card.name });
  const image = `/card/image?${cardQuery(p)}&lang=${locale}`;
  return {
    title,
    description: m.card.desc,
    openGraph: { title, description: m.card.desc, images: [{ url: image, width: 1080, height: 1350 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export const dynamic = "force-dynamic";

/** 나만의 리마인 카드: 주소에 카드 정보가 있으면 그 카드를 보여주고(친구가 보낸 링크), 없으면 만들기 */
export default async function CardPage({ searchParams }: { searchParams: Search }) {
  const { m, locale } = await getI18n();
  const sp = await searchParams;
  const p = parseCardParams((k) => sp[k]);

  if (hasCard(p)) {
    const card = await getCardData(p, locale);
    const title = fmt(m.card.friendCard, { name: card.name });
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader eyebrow="REMINE CARD" title={title} description={m.card.desc} />
        {/* eslint-disable-next-line @next/next/no-img-element -- 직접 만든 카드 이미지 */}
        <img
          src={`/card/image?${cardQuery(p)}&lang=${locale}`}
          alt={fmt(m.card.alt, { name: card.name })}
          width={1080}
          height={1350}
          className="mb-5 h-auto w-full border border-lilac-200 bg-white"
        />
        <Link href="/card" className="btn block bg-lilac-500 py-3 text-center text-lg font-extrabold text-white hover:bg-lilac-700">
          {m.card.makeMine}
        </Link>
      </div>
    );
  }

  // 로그인했으면 닉네임·최애를 미리 채움
  let me: { id: string; nickname: string; favs: MemberSlug[] } | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, { data: favRows }] = await Promise.all([
        supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle(),
        supabase.from("favorite_members").select("member_slug"),
      ]);
      me = {
        id: user.id,
        nickname: profile?.nickname ?? m.auth.defaultNickname,
        favs: (favRows ?? []).map((r) => r.member_slug as MemberSlug),
      };
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader eyebrow="REMINE CARD" title={m.card.title} description={m.card.desc} />
      <CardBuilder me={me} />
    </div>
  );
}
