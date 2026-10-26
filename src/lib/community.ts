/**
 * 2단계 커뮤니티(포카·게시판) 데이터 조회. Supabase DB에서 읽어옵니다.
 * 쓰기·삭제는 각 페이지 폴더의 actions.ts 와 폼 컴포넌트에 있습니다.
 */
import { PHOTOCARD_BUCKET, POST_IMAGE_BUCKET, supabaseUrl } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Photocard, Post, PostComment, PostSummary } from "@/types";

export const POSTS_PER_PAGE = 20;

export type BoardTab = "all" | "best";

// "*" 로 읽는 이유: 조회수·사진 컬럼(0002 SQL)이 아직 없어도 게시판이 깨지지 않게
const POST_SUMMARY_COLUMNS = "*, profiles(nickname), comments(count)";

function publicUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function photocardImageUrl(path: string) {
  return publicUrl(PHOTOCARD_BUCKET, path);
}

export function postImageUrl(path: string) {
  return publicUrl(POST_IMAGE_BUCKET, path);
}

export async function getPhotocards(member?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("photocards")
    .select("id, user_id, member, album, description, image_path, created_at, profiles(nickname)")
    .order("created_at", { ascending: false })
    .limit(120);
  if (member) query = query.eq("member", member);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Photocard[];
}

/** 게시판 목록. tab "best" 는 조회수 높은 순 */
export async function getPosts(page: number, tab: BoardTab = "all") {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const run = (byViews: boolean) => {
    let query = supabase.from("posts").select(POST_SUMMARY_COLUMNS, { count: "exact" });
    if (byViews) query = query.order("view_count", { ascending: false });
    return query.order("created_at", { ascending: false }).range(from, from + POSTS_PER_PAGE - 1);
  };

  let result = await run(tab === "best");
  // 조회수 컬럼(0002 SQL)이 아직 없으면 최신순으로 대신 보여줌
  if (result.error && tab === "best") result = await run(false);
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
    supabase.from("posts").select("*, profiles(nickname)").eq("id", id).maybeSingle(),
    supabase
      .from("comments")
      .select("id, user_id, content, created_at, profiles(nickname)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);
  return {
    post: post as unknown as Post | null,
    comments: (comments ?? []) as unknown as PostComment[],
  };
}
