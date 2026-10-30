-- 컴백 응원 롤링페이퍼: 회원마다 내 응원 페이지를 하나 만들고, 링크를 받은 사람들이 리센느에게 보내는 응원을 붙임
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0015 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 응원은 리센느에게 보내는 공개 메시지라 누구나 볼 수 있음. 쓰는 건 로그인한 회원만 (이용 제한 중이면 못 씀)
-- 응원은 쓴 사람·페이지 주인·운영자가 뗄 수 있음. 탈퇴하면 내 페이지와 내가 쓴 응원이 함께 지워짐

create table if not exists public.cheer_papers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cheer_messages (
  id bigint generated always as identity primary key,
  paper_id uuid not null references public.cheer_papers (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- 누구에게 (비우면 리센느 모두에게). 쪽지 색깔로 씀
  member text check (member is null or member in ('woni', 'liv', 'minami', 'may', 'zena')),
  content text not null check (char_length(btrim(content)) between 1 and 100),
  created_at timestamptz not null default now()
);

create index if not exists cheer_messages_paper_idx on public.cheer_messages (paper_id, created_at desc);
create index if not exists cheer_messages_recent_idx on public.cheer_messages (created_at desc);

alter table public.cheer_papers enable row level security;
alter table public.cheer_messages enable row level security;

-- 페이지: 누구나 보기, 회원은 자기 것 하나만 만들기·지우기
drop policy if exists "cheer papers are public" on public.cheer_papers;
create policy "cheer papers are public" on public.cheer_papers for select using (true);

drop policy if exists "make own cheer paper" on public.cheer_papers;
create policy "make own cheer paper" on public.cheer_papers
  for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "delete own cheer paper" on public.cheer_papers;
create policy "delete own cheer paper" on public.cheer_papers
  for delete to authenticated using (auth.uid() = owner_id or public.is_admin());

-- 응원: 누구나 보기, 회원이 붙이기 (하루 30개까지, 이용 제한 중이면 못 씀)
drop policy if exists "cheers are public" on public.cheer_messages;
create policy "cheers are public" on public.cheer_messages for select using (true);

drop policy if exists "post cheers" on public.cheer_messages;
create policy "post cheers" on public.cheer_messages
  for insert to authenticated
  with check (
    auth.uid() = author_id
    and not public.is_banned()
    and (
      select count(*) from public.cheer_messages c
      where c.author_id = auth.uid() and c.created_at > now() - interval '1 day'
    ) < 30
  );

-- 떼기: 쓴 사람, 페이지 주인, 운영자
drop policy if exists "remove cheers" on public.cheer_messages;
create policy "remove cheers" on public.cheer_messages
  for delete to authenticated
  using (
    auth.uid() = author_id
    or public.is_admin()
    or exists (select 1 from public.cheer_papers p where p.id = paper_id and p.owner_id = auth.uid())
  );

-- 쓸 수 있는 칸 제한: 페이지는 그냥 만들기만, 응원은 페이지·받는 멤버·내용만 (쓴 사람·시각은 자동). 고치기는 없음
revoke insert, update on public.cheer_papers from anon, authenticated;
revoke insert, update on public.cheer_messages from anon, authenticated;
grant insert (owner_id) on public.cheer_papers to authenticated;
grant insert (paper_id, member, content) on public.cheer_messages to authenticated;
revoke delete on public.cheer_papers, public.cheer_messages from anon;
