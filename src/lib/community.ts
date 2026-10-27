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
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase.from("posts").select("*, profiles(*)").eq("id", id).maybeSingle(),
    supabase
      .from("comments")
      .select("id, user_id, content, created_at, profiles(*)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);
  return {
    post: post as unknown as Post | null,
    comments: (comments ?? []) as unknown as PostComment[],
  };
}

/* ───────────────────────── 포카 도감 ───────────────────────── */

/** 도감 전체 카드. 도감 SQL(0003) 실행 전이면 빈 배열 */
export async function getCatalog(): Promise<CatalogCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photocard_catalog")
    .select("id, album, member, label, image_path, sort")
    .order("album")
    .order("sort")
    .order("id");
  if (error) return [];
  return (data ?? []) as CatalogCard[];
}

export async function getCatalogCard(id: number): Promise<CatalogCard | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photocard_catalog")
    .select("id, album, member, label, image_path, sort")
    .eq("id", id)
    .maybeSingle();
  return (data as CatalogCard | null) ?? null;
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
