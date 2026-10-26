/**
 * 2단계 커뮤니티(포카·게시판) 데이터 조회. Supabase DB에서 읽어옵니다.
 * 쓰기·삭제는 각 페이지 폴더의 actions.ts 에 있습니다.
 */
import { PHOTOCARD_BUCKET, supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Photocard, Post, PostComment, PostSummary } from "@/types";

export const POSTS_PER_PAGE = 20;

export function photocardImageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${PHOTOCARD_BUCKET}/${path}`;
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

export async function getPosts(page: number) {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const { data, error, count } = await supabase
    .from("posts")
    .select("id, title, created_at, profiles(nickname), comments(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + POSTS_PER_PAGE - 1);
  if (error) throw new Error(error.message);
  return { posts: (data ?? []) as unknown as PostSummary[], total: count ?? 0 };
}

export async function getPost(id: number) {
  const supabase = await createClient();
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, user_id, title, content, created_at, profiles(nickname)")
      .eq("id", id)
      .maybeSingle(),
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
