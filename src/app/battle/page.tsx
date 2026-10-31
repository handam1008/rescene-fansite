import type { Metadata } from "next";
import QuizBattle from "@/components/QuizBattle";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.battle.title, description: m.battle.desc };
}

export default async function BattlePage() {
  const { m } = await getI18n();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Quiz Battle" title={m.battle.title} description={m.battle.desc} />
      <QuizBattle />
    </div>
  );
}
