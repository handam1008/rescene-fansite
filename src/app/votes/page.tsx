import type { Metadata } from "next";
import VoteCard from "@/components/VoteCard";
import { EmptyState, PageHeader } from "@/components/ui";
import { getVotes } from "@/lib/data";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.votes.title };
}

// 마감 여부가 시간에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function VotesPage() {
  const votes = await getVotes();
  const { m } = await getI18n();

  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title={m.votes.title}
        description={m.votes.desc}
      />
      {votes.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {votes.map((vote) => (
            <VoteCard key={vote.id} vote={vote} />
          ))}
        </div>
      ) : (
        <EmptyState>{m.votes.empty}</EmptyState>
      )}
    </>
  );
}
