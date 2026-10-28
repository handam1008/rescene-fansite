-- LIVE: 리센느가 출연하는 방송·공연, 안원잘부 최초 공개 등 "지금 라이브" 링크
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0013 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 운영자가 /admin 의 "라이브" 탭에서 제목·주소·시작/끝 시각을 넣으면,
-- 그 시간 동안 사이트 위쪽에 빨간 LIVE 줄이 뜨고 /live 에서 바로 볼 수 있습니다.

create table if not exists public.live_links (
  id bigint generated always as identity primary key,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  url text not null check (url ~ '^https://'),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint live_links_time_order check (ends_at > starts_at)
);

create index if not exists live_links_ends_at_idx on public.live_links (ends_at);

alter table public.live_links enable row level security;

-- 누구나 볼 수 있고, 운영자만 추가·수정·삭제
drop policy if exists "live links are public" on public.live_links;
create policy "live links are public" on public.live_links
  for select using (true);

drop policy if exists "admins manage live links" on public.live_links;
create policy "admins manage live links" on public.live_links
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
