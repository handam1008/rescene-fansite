-- RESCENE 팬사이트 2단계: 회원(닉네임) · 포카 · 게시판
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 여러 번 실행해도 안전하도록 작성했습니다.

-- ───────────────────────── 회원 프로필 ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 20),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles
  for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 회원가입 시 입력한 닉네임으로 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), 'user_' || left(new.id::text, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── 포카 ─────────────────────────
create table if not exists public.photocards (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  member text not null,
  album text,
  description text check (char_length(description) <= 300),
  image_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists photocards_created_at_idx on public.photocards (created_at desc);

alter table public.photocards enable row level security;

drop policy if exists "photocards are public" on public.photocards;
create policy "photocards are public" on public.photocards
  for select using (true);

drop policy if exists "users insert own photocards" on public.photocards;
create policy "users insert own photocards" on public.photocards
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users delete own photocards" on public.photocards;
create policy "users delete own photocards" on public.photocards
  for delete to authenticated using (auth.uid() = user_id);

-- 포카 이미지 저장소: 누구나 볼 수 있고, 로그인한 사람은 자기 폴더(<user id>/...)에만 올리고 지울 수 있음
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photocards', 'photocards', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "photocard images upload own folder" on storage.objects;
create policy "photocard images upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photocards' and (storage.foldername(name))[1] = auth.uid()::text);

-- 파일 삭제 API는 해당 파일을 "읽을 수 있어야" 지울 수 있어서 본인 폴더 읽기 권한도 필요
-- (공개 버킷이라 이미지 보기는 이 정책과 상관없이 누구나 가능)
drop policy if exists "photocard images read own folder" on storage.objects;
create policy "photocard images read own folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'photocards' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photocard images delete own folder" on storage.objects;
create policy "photocard images delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photocards' and (storage.foldername(name))[1] = auth.uid()::text);

-- ───────────────────────── 게시판 ─────────────────────────
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts are public" on public.posts;
create policy "posts are public" on public.posts
  for select using (true);

drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts" on public.posts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users delete own posts" on public.posts;
create policy "users delete own posts" on public.posts
  for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments are public" on public.comments;
create policy "comments are public" on public.comments
  for select using (true);

drop policy if exists "users insert own comments" on public.comments;
create policy "users insert own comments" on public.comments
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments" on public.comments
  for delete to authenticated using (auth.uid() = user_id);
