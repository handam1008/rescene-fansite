import type { Metadata } from "next";
import VoteCard from "@/components/VoteCard";
import { EmptyState, PageHeader } from "@/components/ui";
import { getVotes } from "@/lib/data";

export const metadata: Metadata = { title: "투표 안내" };

// 마감 여부가 시간에 따라 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function VotesPage() {
  const votes = await getVotes();

  return (
    <>
      <PageHeader
        eyebrow="Vote"
        title="투표 안내"
        description="진행 중인 투표가 위에, 마감된 투표는 아래에 정리돼요."
      />
      {votes.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {votes.map((vote) => (
            <VoteCard key={vote.id} vote={vote} />
          ))}
        </div>
      ) : (
        <EmptyState>등록된 투표가 없어요.</EmptyState>
      )}
    </>
  );
}
