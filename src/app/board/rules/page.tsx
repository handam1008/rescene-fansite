import type { Metadata } from "next";
import Link from "next/link";
import { BoardRulesFull } from "@/components/BoardRules";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "게시판 규칙" };

export default function BoardRulesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Board"
        title="게시판 규칙"
        description="모두가 편하게 리센느 얘기를 나눌 수 있도록 꼭 지켜주세요. 멤버 게시판에도 똑같이 적용돼요."
      />
      <BoardRulesFull />
      <p className="mt-6 text-center">
        <Link href="/board" className="text-sm font-semibold text-lilac-700 underline">
          ← 게시판으로
        </Link>
      </p>
    </div>
  );
}
