import type { Metadata } from "next";
import Link from "next/link";
import { BoardRulesFull } from "@/components/BoardRules";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.board.rules };
}

export default async function BoardRulesPage() {
  const { m } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Board" title={m.board.rules} description={m.board.rulesDesc} />
      <BoardRulesFull />
      <p className="mt-6 text-center">
        <Link href="/board" className="text-sm font-semibold text-lilac-700 underline">
          {m.board.backToBoard}
        </Link>
      </p>
    </div>
  );
}
