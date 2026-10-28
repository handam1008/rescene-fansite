-- 최애 멤버: 로그인한 회원이 최애 멤버를 고름 (여러 명 가능, 언제든 바꿀 수 있음)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0011 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 누가 누구를 골랐는지는 본인만 볼 수 있음.
-- 멤버별 인원수도 공개하지 않음 (멤버끼리 인기 비교·줄세우기가 생기지 않게)

create table if not exists public.favorite_members (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  member_slug text not null check (member_slug in ('woni', 'liv', 'minami', 'may', 'zena')),
  created_at timestamptz not null default now(),
  primary key (user_id, member_slug)
);

alter table public.favorite_members enable row level security;

drop policy if exists "own favorites" on public.favorite_members;
create policy "own favorites" on public.favorite_members
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "add own favorites" on public.favorite_members;
create policy "add own favorites" on public.favorite_members
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "remove own favorites" on public.favorite_members;
create policy "remove own favorites" on public.favorite_members
  for delete to authenticated using (auth.uid() = user_id);
