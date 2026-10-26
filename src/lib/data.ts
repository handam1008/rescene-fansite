/**
 * 데이터 접근 계층.
 *
 * 페이지는 data 폴더를 직접 import하지 않고 반드시 이 파일의 함수만 사용합니다.
 * 나중에 Supabase로 옮길 때는 이 파일의 함수 내부만
 *   const { data } = await supabase.from("songs").select("*")
 * 같은 코드로 바꾸면 되고, 페이지 코드는 손댈 필요가 없습니다.
 * (그래서 지금은 필요 없어도 함수가 모두 async입니다.)
 */
import { comebacks } from "@/data/comeback";
import { songs } from "@/data/songs";
import { votes } from "@/data/votes";
import type { Comeback, Song, Vote, VoteStatus } from "@/types";

const time = (iso: string) => new Date(iso).getTime();

export async function getLatestComeback(): Promise<Comeback | null> {
  return comebacks[0] ?? null;
}

/** 발매일 최신순 */
export async function getSongs(): Promise<Song[]> {
  return [...songs].sort((a, b) => time(b.releaseDate) - time(a.releaseDate));
}

export function getVoteStatus(vote: Vote, now: Date = new Date()): VoteStatus {
  const t = now.getTime();
  if (t < time(vote.startDate)) return "upcoming";
  if (t > time(vote.endDate)) return "ended";
  return "ongoing";
}

const statusOrder: Record<VoteStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  ended: 2,
};

/** 진행 중(마감 임박순) → 예정(시작 빠른순) → 종료(최근 종료순) */
export async function getVotes(now: Date = new Date()) {
  return votes
    .map((vote) => ({ ...vote, status: getVoteStatus(vote, now) }))
    .sort((a, b) => {
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.status === "ongoing") return time(a.endDate) - time(b.endDate);
      if (a.status === "upcoming") return time(a.startDate) - time(b.startDate);
      return time(b.endDate) - time(a.endDate);
    });
}

export type VoteWithStatus = Awaited<ReturnType<typeof getVotes>>[number];
