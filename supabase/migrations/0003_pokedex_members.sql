-- 포토카드 도감 · 관리자 · 칭호 · 멤버별 게시판
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001, 0002 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.

-- ───────────────────────── 프로필: 관리자 · 수집 개수 ─────────────────────────
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists collected_count integer not null default 0;

-- 본인 프로필은 닉네임만 바꿀 수 있게 (관리자 여부·수집 개수를 스스로 못 바꾸도록)
revoke update on public.profiles from anon, authenticated;
grant update (nickname) on public.profiles to authenticated;

-- 지금 로그인한 사람이 관리자인지
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────── 멤버별 게시판 ─────────────────────────
-- 비어 있으면 전체 게시판 글, 값이 있으면 해당 멤버 게시판 글
alter table public.posts add column if not exists member text;
alter table public.posts drop constraint if exists posts_member_valid;
alter table public.posts add constraint posts_member_valid
  check (member is null or member in ('woni', 'liv', 'minami', 'may', 'zena'));
create index if not exists posts_member_idx on public.posts (member, created_at desc);

-- ───────────────────────── 포토카드 도감 ─────────────────────────
-- 시중에 나온 공식 포토카드 목록 (관리자만 등록)
create table if not exists public.photocard_catalog (
  id bigint generated always as identity primary key,
  album text not null check (char_length(album) between 1 and 60),
  member text not null check (member in ('woni', 'liv', 'minami', 'may', 'zena', 'group')),
  label text not null default '' check (char_length(label) <= 60),
  image_path text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photocard_catalog_album_idx on public.photocard_catalog (album, sort, id);

alter table public.photocard_catalog enable row level security;

drop policy if exists "catalog is public" on public.photocard_catalog;
create policy "catalog is public" on public.photocard_catalog
  for select using (true);

drop policy if exists "admins manage catalog" on public.photocard_catalog;
create policy "admins manage catalog" on public.photocard_catalog
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 회원이 실물 카드를 찍어 올린 인증 (관리자가 승인하면 도감에 채워짐)
create table if not exists public.photocard_collections (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  card_id bigint not null references public.photocard_catalog (id) on delete cascade,
  photo_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text check (char_length(reject_reason) <= 200),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, card_id)
);

create index if not exists photocard_collections_status_idx on public.photocard_collections (status, created_at);

alter table public.photocard_collections enable row level security;

-- 본인 인증 기록만 보이고, 관리자는 전부 봄
drop policy if exists "own collections or admin" on public.photocard_collections;
create policy "own collections or admin" on public.photocard_collections
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- 인증 신청: 본인 것만, 항상 "확인 중" 상태로, 사진은 본인 폴더에 있는 것만
drop policy if exists "users submit own proof" on public.photocard_collections;
create policy "users submit own proof" on public.photocard_collections
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewed_at is null
    and photo_path like auth.uid()::text || '/%'
  );

-- 승인·거절은 관리자만
drop policy if exists "admins review proofs" on public.photocard_collections;
create policy "admins review proofs" on public.photocard_collections
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 본인 기록 삭제(다시 신청할 때) 또는 관리자 삭제
drop policy if exists "users delete own proof" on public.photocard_collections;
create policy "users delete own proof" on public.photocard_collections
  for delete to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- 승인된 카드 수를 프로필에 자동 반영 (칭호 계산용)
create or replace function public.refresh_collected_count()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target uuid := coalesce(new.user_id, old.user_id);
begin
  update public.profiles
  set collected_count = (
    select count(*) from public.photocard_collections
    where user_id = target and status = 'approved'
  )
  where id = target;
  return null;
end;
$$;

drop trigger if exists photocard_collections_count on public.photocard_collections;
create trigger photocard_collections_count
  after insert or update or delete on public.photocard_collections
  for each row execute function public.refresh_collected_count();

-- ───────────────────────── 사진 저장소 ─────────────────────────
-- 도감 카드 이미지: 누구나 보고, 관리자만 올리고 지움
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pc-catalog', 'pc-catalog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "admins upload catalog images" on storage.objects;
create policy "admins upload catalog images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pc-catalog' and public.is_admin());

drop policy if exists "admins read catalog images" on storage.objects;
create policy "admins read catalog images" on storage.objects
  for select to authenticated
  using (bucket_id = 'pc-catalog' and public.is_admin());

drop policy if exists "admins delete catalog images" on storage.objects;
create policy "admins delete catalog images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pc-catalog' and public.is_admin());

-- 인증 사진: 비공개. 본인과 관리자만 볼 수 있음
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pc-proofs', 'pc-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "users upload own proofs" on storage.objects;
create policy "users upload own proofs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pc-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own proofs or admin read" on storage.objects;
create policy "own proofs or admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'pc-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists "own proofs or admin delete" on storage.objects;
create policy "own proofs or admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pc-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ───────────────────────── 정리 ─────────────────────────
-- 예전 "회원이 포카 올리는" 기능의 테이블 (도감으로 바뀌어 사용하지 않음, 비어 있음)
drop table if exists public.photocards;

-- 사이트 운영자 계정을 관리자로 지정
update public.profiles set is_admin = true where nickname = '류한담';
