/**
 * 2단계 커뮤니티(게시판·포카 도감) 데이터 조회. Supabase DB에서 읽어옵니다.
 * 쓰기·삭제는 각 페이지 폴더의 actions.ts 와 폼 컴포넌트에 있습니다.
 */
import { CATALOG_BUCKET, POST_IMAGE_BUCKET, PROOF_BUCKET, supabaseUrl } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { CatalogCard, CollectionEntry, Post, PostComment, PostSummary } from "@/types";

export const POSTS_PER_PAGE = 20;

export type BoardTab = "all" | "best";

// "*" 로 읽는 이유: 새 컬럼(조회수·사진·멤버·칭호)용 SQL이 아직 실행 전이어도 게시판이 깨지지 않게
const POST_SUMMARY_COLUMNS = "*, profiles(*), comments(count)";

function publicUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function postImageUrl(path: string) {
  return publicUrl(POST_IMAGE_BUCKET, path);
}

export function catalogImageUrl(path: string) {
  return publicUrl(CATALOG_BUCKET, path);
}

/** 게시판 목록. tab "best" 는 조회수 높은 순, member 를 주면 그 멤버 게시판 글만 */
export async function getPosts(page: number, tab: BoardTab = "all", member?: string) {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const run = (byViews: boolean) => {
    let query = supabase.from("posts").select(POST_SUMMARY_COLUMNS, { count: "exact" });
    if (member) query = query.eq("member", member);
    if (byViews) query = query.order("view_count", { ascending: false });
    return query.order("created_at", { ascending: false }).range(from, from + POSTS_PER_PAGE - 1);
  };

  let result = await run(tab === "best");
  // 조회수 컬럼(0002 SQL)이 아직 없으면 최신순으로 대신 보여줌
  if (result.error && tab === "best") result = await run(false);
  // 멤버 칸(0003 SQL)이 아직 없으면 멤버 게시판은 빈 목록으로
  if (result.error && member) return { posts: [] as PostSummary[], total: 0 };
  if (result.error) throw new Error(result.error.message);
  return { posts: (result.data ?? []) as unknown as PostSummary[], total: result.count ?? 0 };
}

/**
 * 홈 화면 인기글: 최근 7일 글 중 조회수 높은 순. 최근 글이 부족하면 전체 기간에서 채웁니다.
 * 쿠키 없는 클라이언트를 써서 홈 페이지를 정적으로 유지하고, 실패해도 홈이 깨지지 않게 빈 배열을 돌려줍니다.
 */
export async function getPopularPosts(limit = 5): Promise<PostSummary[]> {
  try {
    const supabase = createPublicClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let byViews = true;
    const base = () => {
      let query = supabase.from("posts").select(POST_SUMMARY_COLUMNS);
      if (byViews) query = query.order("view_count", { ascending: false });
      return query.order("created_at", { ascending: false }).limit(limit);
    };

    let recent = await base().gte("created_at", weekAgo);
    if (recent.error) {
      // 조회수 컬럼(0002 SQL)이 아직 없으면 최신순으로 대신 보여줌
      byViews = false;
      recent = await base().gte("created_at", weekAgo);
    }
    if (recent.error) throw recent.error;
    let posts = (recent.data ?? []) as unknown as PostSummary[];

    if (posts.length < limit) {
      const all = await base();
      if (all.error) throw all.error;
      const seen = new Set(posts.map((p) => p.id));
      posts = posts.concat(((all.data ?? []) as unknown as PostSummary[]).filter((p) => !seen.has(p.id)));
    }
    return posts.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getPost(id: number) {
  const supabase = await createClient();
  const [{ data: post }, { data: comments }, mine] = await Promise.all([
    supabase.from("posts").select("*, profiles(*)").eq("id", id).maybeSingle(),
    supabase
      .from("comments")
      .select("id, user_id, content, created_at, profiles(*)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    getMyReaction(id),
  ]);
  return {
    post: post as unknown as Post | null,
    comments: (comments ?? []) as unknown as PostComment[],
    ...mine,
  };
}

/** 내가 이 글에 누른 추천(1)/비추천(-1)과 신고 여부. 로그인 전이거나 0007 SQL 전이면 없음 */
async function getMyReaction(postId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { myVote: 0, reported: false };
  const [{ data: vote }, { data: report }] = await Promise.all([
    supabase.from("post_votes").select("value").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
    supabase.from("post_reports").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
  ]);
  return { myVote: (vote?.value as number | undefined) ?? 0, reported: !!report };
}

export type ModerationPost = Post & { post_reports: { reason: string; detail: string | null }[] };

/** 운영자: 숨겨진 글과 신고가 들어온 글 (최근 순) */
export async function getModerationQueue(): Promise<ModerationPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), post_reports(reason, detail)")
    .or("hidden_at.not.is.null,report_count.gt.0")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as unknown as ModerationPost[];
}

/* ───────────────────────── 포카 도감 ───────────────────────── */

/** 도감 전체 카드. 도감 SQL(0003) 실행 전이면 빈 배열 */
export async function getCatalog(): Promise<CatalogCard[]> {
  const supabase = await createClient();
  // "*" : 출처 칸(0004 SQL)이 없어도 동작하도록
  const { data, error } = await supabase.from("photocard_catalog").select("*").order("sort").order("id");
  if (error) return [];
  return (data ?? []) as CatalogCard[];
}

export async function getCatalogCard(id: number): Promise<CatalogCard | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("photocard_catalog").select("*").eq("id", id).maybeSingle();
  return (data as CatalogCard | null) ?? null;
}

/* 아래 셋은 공개 데이터라 쿠키 없는 클라이언트로 읽음 (홈 화면을 정적으로 유지). 실패하면 빈 값 */

/** 회원 id → 닉네임 (도감 제공자 표시용) */
export async function getNicknames(ids: (string | null | undefined)[]) {
  const names = new Map<string, string>();
  const unique = [...new Set(ids.filter((id): id is string => !!id))];
  if (unique.length === 0) return names;
  try {
    const { data } = await createPublicClient().from("profiles").select("id, nickname").in("id", unique);
    for (const p of data ?? []) names.set(p.id, p.nickname);
  } catch {}
  return names;
}

export type ContributorRank = { id: string; nickname: string; contributed_count: number; contributor_rank: number };

/** 도감 기여 랭킹 (첫 제공 장수 순). 0006 SQL 전이면 빈 배열 */
export async function getContributorRanking(limit = 10): Promise<ContributorRank[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("profiles")
      .select("id, nickname, contributed_count, contributor_rank")
      .not("contributor_rank", "is", null)
      .order("contributor_rank")
      .limit(limit);
    if (error) return [];
    return (data ?? []) as ContributorRank[];
  } catch {
    return [];
  }
}

/** 홈 화면 도감 소식: 전체·채워진 장수와 최근 채워진 카드 */
export async function getPokedexNews(limit = 5) {
  try {
    const supabase = createPublicClient();
    const [all, recent] = await Promise.all([
      supabase.from("photocard_catalog").select("image_path"),
      supabase.from("photocard_catalog").select("*").not("filled_at", "is", null).order("filled_at", { ascending: false }).limit(limit),
    ]);
    if (all.error) return null;
    const cards = (recent.data ?? []) as CatalogCard[];
    const names = await getNicknames(cards.map((c) => c.first_contributor));
    return {
      total: all.data.length,
      filled: all.data.filter((c) => c.image_path).length,
      recent: cards.map((card) => ({ card, nickname: card.first_contributor ? names.get(card.first_contributor) : undefined })),
    };
  } catch {
    return null;
  }
}

/** 로그인한 사람의 인증 기록 (보안 규칙상 본인 것만 읽힘). card_id → 기록 */
export async function getMyCollections(userId: string | undefined) {
  const map = new Map<number, CollectionEntry>();
  if (!userId) return map;
  const supabase = await createClient();
  const { data } = await supabase.from("photocard_collections").select("*").eq("user_id", userId);
  for (const entry of (data ?? []) as CollectionEntry[]) map.set(entry.card_id, entry);
  return map;
}

/** 비공개 인증 사진을 잠깐(10분) 볼 수 있는 주소. 본인 또는 관리자만 만들 수 있음 */
export async function proofImageUrls(paths: string[]) {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PROOF_BUCKET).createSignedUrls(paths, 600);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return urls;
}

export type PendingProof = CollectionEntry & {
  profiles: { nickname: string } | null;
  photocard_catalog: CatalogCard | null;
};

/** 관리자: 확인 대기 중인 인증 (오래된 순) */
export async function getPendingProofs(): Promise<PendingProof[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photocard_collections")
    .select("*, profiles(nickname), photocard_catalog(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) return [];
  return (data ?? []) as unknown as PendingProof[];
}
