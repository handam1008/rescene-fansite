-- 게시판: 추천·비추천 · 신고 · 자동 숨김
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0006 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 신고나 비추천이 기준을 넘으면 글이 자동으로 "숨김" 처리됩니다(다른 사람에게는 삭제된 것처럼 안 보임).
-- 몰려와서 신고하는 경우를 대비해 바로 지우지 않고, 운영자가 /admin 에서 복구하거나 완전히 삭제합니다.
-- 기준 숫자는 아래 public.auto_hide_post() 안에서 바꾸면 됩니다.

-- ───────────────────────── 글: 추천 수 · 신고 수 · 숨김 ─────────────────────────
alter table public.posts add column if not exists like_count integer not null default 0;
alter table public.posts add column if not exists dislike_count integer not null default 0;
alter table public.posts add column if not exists report_count integer not null default 0;
-- 숨겨진 때와 이유 ('reports' 신고 누적, 'dislikes' 비추천 누적, 'admin' 운영자)
alter table public.posts add column if not exists hidden_at timestamptz;
alter table public.posts add column if not exists hidden_reason text;
alter table public.posts drop constraint if exists posts_hidden_reason_valid;
alter table public.posts add constraint posts_hidden_reason_valid
  check (hidden_reason is null or hidden_reason in ('reports', 'dislikes', 'admin'));
-- 운영자가 복구한 글은 다시 자동으로 숨기지 않음
alter table public.posts add column if not exists restored_at timestamptz;

create index if not exists posts_like_count_idx on public.posts (like_count desc, created_at desc);

-- 숨긴 글은 글쓴이와 운영자만 볼 수 있음
drop policy if exists "posts are public" on public.posts;
create policy "posts are public" on public.posts
  for select using (hidden_at is null or auth.uid() = user_id or public.is_admin());

-- 운영자: 숨김·복구, 다른 사람 글·댓글 삭제
drop policy if exists "admins moderate posts" on public.posts;
create policy "admins moderate posts" on public.posts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users delete own posts" on public.posts;
create policy "users delete own posts" on public.posts
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments" on public.comments
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- ───────────────────────── 추천·비추천 ─────────────────────────
-- 한 사람이 한 글에 하나만 (추천 1 / 비추천 -1). 다시 누르면 취소, 반대로 누르면 바뀜
-- 기본키를 (post_id, user_id) 로 하지 않는 이유: 그러면 API가 posts↔profiles 다대다 연결로 착각해서
-- 게시판의 글쓴이 조회(profiles(*))가 모호해짐. 대신 unique 로 한 번만 누르게 함
create table if not exists public.post_votes (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_votes enable row level security;

-- 내가 누른 것만 보임 (누가 눌렀는지는 공개하지 않음)
drop policy if exists "own votes" on public.post_votes;
create policy "own votes" on public.post_votes
  for select to authenticated using (auth.uid() = user_id);

-- 본인 글에는 못 누르고, 숨겨진 글에도 못 누름
drop policy if exists "users vote" on public.post_votes;
create policy "users vote" on public.post_votes
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.posts p where p.id = post_id and p.hidden_at is null and p.user_id <> auth.uid())
  );

-- 바꿀 수 있는 건 추천/비추천 값뿐 (다른 글로 옮기지 못하게)
revoke update on public.post_votes from anon, authenticated;
grant update (value) on public.post_votes to authenticated;

drop policy if exists "users change vote" on public.post_votes;
create policy "users change vote" on public.post_votes
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users cancel vote" on public.post_votes;
create policy "users cancel vote" on public.post_votes
  for delete to authenticated using (auth.uid() = user_id);

-- ───────────────────────── 신고 ─────────────────────────
create table if not exists public.post_reports (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'adult', 'privacy', 'copyright', 'other')),
  detail text check (char_length(detail) <= 200),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_reports_post_idx on public.post_reports (post_id);

alter table public.post_reports enable row level security;

drop policy if exists "own reports or admin" on public.post_reports;
create policy "own reports or admin" on public.post_reports
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

-- 한 글에 한 번, 본인 글은 신고 못 함
drop policy if exists "users report" on public.post_reports;
create policy "users report" on public.post_reports
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.posts p where p.id = post_id and p.hidden_at is null and p.user_id <> auth.uid())
  );

drop policy if exists "admins clear reports" on public.post_reports;
create policy "admins clear reports" on public.post_reports
  for delete to authenticated using (public.is_admin());

-- ───────────────────────── 집계 · 자동 숨김 ─────────────────────────
-- 자동 숨김 기준: 신고 5건 이상, 또는 비추천 10개 이상이면서 추천의 2배 이상
create or replace function public.auto_hide_post(p_post_id bigint)
returns void
language sql
security definer set search_path = ''
as $$
  update public.posts
  set hidden_at = now(),
      hidden_reason = case when report_count >= 5 then 'reports' else 'dislikes' end
  where id = p_post_id
    and hidden_at is null
    and restored_at is null
    and (report_count >= 5 or (dislike_count >= 10 and dislike_count >= like_count * 2));
$$;

revoke execute on function public.auto_hide_post(bigint) from public, anon, authenticated;

create or replace function public.refresh_post_votes()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target bigint := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set like_count = (select count(*) from public.post_votes where post_id = target and value = 1),
      dislike_count = (select count(*) from public.post_votes where post_id = target and value = -1)
  where id = target;
  perform public.auto_hide_post(target);
  return null;
end;
$$;

drop trigger if exists post_votes_count on public.post_votes;
create trigger post_votes_count
  after insert or update or delete on public.post_votes
  for each row execute function public.refresh_post_votes();

create or replace function public.refresh_post_reports()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target bigint := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set report_count = (select count(*) from public.post_reports where post_id = target)
  where id = target;
  perform public.auto_hide_post(target);
  return null;
end;
$$;

drop trigger if exists post_reports_count on public.post_reports;
create trigger post_reports_count
  after insert or delete on public.post_reports
  for each row execute function public.refresh_post_reports();

-- ───────────────────────── 운영자: 삭제한 글의 사진 파일 지우기 ─────────────────────────
-- 파일 삭제 API는 읽기 권한도 필요
drop policy if exists "admins read post images" on storage.objects;
create policy "admins read post images" on storage.objects
  for select to authenticated
  using (bucket_id = 'post-images' and public.is_admin());

drop policy if exists "admins delete post images" on storage.objects;
create policy "admins delete post images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and public.is_admin());
