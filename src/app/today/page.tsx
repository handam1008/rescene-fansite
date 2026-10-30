import type { Metadata } from "next";
import Link from "next/link";
import TodayActions from "@/components/TodayActions";
import { PageHeader } from "@/components/ui";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { SITE_URL } from "@/lib/site-url";
import { getTodayCard } from "@/lib/today";

export async function generateMetadata(): Promise<Metadata> {
  const { m, locale } = await getI18n();
  // 이 페이지 링크를 공유하면 미리보기에 오늘 카드가 뜨게
  const image = `/today/card?lang=${locale}`;
  return {
    title: m.today.title,
    description: m.today.desc,
    openGraph: { title: m.today.title, description: m.today.desc, images: [{ url: image, width: 1080, height: 1350 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export const dynamic = "force-dynamic";

/** 오늘의 리센느: 카드 이미지를 보고, 저장하고, X·카톡에 바로 올리기 */
export default async function TodayPage() {
  const { m, locale } = await getI18n();
  const card = await getTodayCard(locale);
  // 날짜를 주소에 넣어서 어제 카드가 캐시에서 나오지 않게
  const imageUrl = `/today/card?lang=${locale}&d=${card.dateKey}`;

  const lines = [fmt(m.today.postText, { date: card.dateLabel })];
  if (card.comeback && card.comeback.big.startsWith("D")) lines.push(fmt(m.today.postDday, { album: card.comeback.album, dday: card.comeback.big }));
  lines.push("", m.today.postMore, `${SITE_URL}/today`, "", "#RESCENE #리센느");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader eyebrow="Today" title={m.today.title} description={m.today.desc} />
      {/* eslint-disable-next-line @next/next/no-img-element -- 직접 만든 카드 이미지 */}
      <img src={imageUrl} alt={m.today.cardAlt} width={1080} height={1350} className="mb-4 h-auto w-full border border-lilac-200 bg-white" />
      <TodayActions imageUrl={imageUrl} fileName={`rescene-today-${card.dateKey}.png`} postText={lines.join("\n")} />
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Link href="/card" className="btn border border-lilac-300 bg-white py-2.5 text-center text-sm font-bold text-lilac-700 hover:bg-lilac-50">
          {m.card.homeLink}
        </Link>
        <Link href="/cheer" className="btn border border-lilac-300 bg-white py-2.5 text-center text-sm font-bold text-lilac-700 hover:bg-lilac-50">
          {m.cheer.homeLink}
        </Link>
      </div>
    </div>
  );
}
