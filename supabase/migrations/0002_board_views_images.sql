-- 게시판 업그레이드: 조회수 · 글에 사진 첨부 (최대 4장)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001_init.sql 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.

-- ───────────────────────── 글: 조회수 · 사진 ─────────────────────────
alter table public.posts add column if not exists view_count integer not null default 0;
alter table public.posts add column if not exists image_paths text[] not null default '{}';

alter table public.posts drop constraint if exists posts_image_paths_max;
alter table public.posts add constraint posts_image_paths_max check (cardinality(image_paths) <= 4);

-- 인기글(조회수순) 조회용
create index if not exists posts_view_count_idx on public.posts (view_count desc, created_at desc);

-- 글을 쓸 때 사진 경로는 반드시 "본인 폴더/..." 여야 함 (남의 사진을 끌어다 붙이지 못하게)
drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts" on public.posts
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from unnest(image_paths) as p(path)
      where p.path not like auth.uid()::text || '/%'
    )
  );

-- 조회수 +1. 글 수정 권한 없이 조회수만 올릴 수 있도록 함수로만 허용
create or replace function public.increment_post_view(p_post_id bigint)
returns void
language sql
security definer set search_path = ''
as $$
  update public.posts set view_count = view_count + 1 where id = p_post_id;
$$;

revoke all on function public.increment_post_view(bigint) from public;
grant execute on function public.increment_post_view(bigint) to anon, authenticated;

-- ───────────────────────── 글 사진 저장소 ─────────────────────────
-- 누구나 볼 수 있고, 로그인한 사람은 자기 폴더(<user id>/...)에만 올리고 지울 수 있음
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "post images upload own folder" on storage.objects;
create policy "post images upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- 파일 삭제 API는 읽기 권한도 필요 (공개 버킷이라 이미지 보기는 이와 상관없이 누구나 가능)
drop policy if exists "post images read own folder" on storage.objects;
create policy "post images read own folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "post images delete own folder" on storage.objects;
create policy "post images delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
