-- 홈 화면 원클릭 투표: 로그인 없이 한 번 눌러서 참여하고 바로 결과(%)를 봄
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0016 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 질문과 보기는 사이트 코드(src/data/quick-poll.ts)에 있고, 여기는 누가 무엇을 골랐는지만 저장합니다.
-- 브라우저마다 무작위 번호로 한 표 (다시 누르면 고른 걸 바꿈).
-- 번호만 바꿔서 몰표를 넣지 못하게, 같은 접속(IP)에서는 투표마다 30표까지만 받습니다.
-- IP 는 그대로 저장하지 않고, 비밀값을 섞어 알아볼 수 없게 바꾼 값(해시)만 저장합니다.

create table if not exists public.quick_poll_votes (
  poll_id text not null check (char_length(poll_id) between 1 and 40),
  voter uuid not null,
  choice text not null check (char_length(choice) between 1 and 30),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, voter)
);

create index if not exists quick_poll_votes_ip_idx on public.quick_poll_votes (poll_id, ip_hash);

-- IP 해시에 섞을 비밀값 (한 번 만들어 두고 계속 씀)
create table if not exists public.quick_poll_salt (
  id boolean primary key default true check (id),
  salt text not null default encode(extensions.gen_random_bytes(32), 'hex')
);
insert into public.quick_poll_salt (id) values (true) on conflict do nothing;

-- 표를 직접 읽고 쓰지 못하게 막고, 아래 두 함수로만 씀
alter table public.quick_poll_votes enable row level security;
alter table public.quick_poll_salt enable row level security;
revoke all on public.quick_poll_votes, public.quick_poll_salt from anon, authenticated;

-- 보기별 표 수
create or replace function public.quick_poll_results(p_poll text)
returns table (choice text, votes bigint)
language sql
stable
security definer set search_path = ''
as $$
  select v.choice, count(*)::bigint from public.quick_poll_votes v where v.poll_id = p_poll group by v.choice;
$$;

-- 한 표 넣기 (이미 했으면 고른 걸 바꿈) 하고 결과 돌려줌
create or replace function public.cast_quick_vote(p_poll text, p_choice text, p_voter uuid)
returns table (choice text, votes bigint)
language plpgsql
security definer set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(
    headers ->> 'cf-connecting-ip',
    btrim(split_part(headers ->> 'x-forwarded-for', ',', 1)),
    'unknown'
  );
  h text;
begin
  select encode(extensions.digest(s.salt || '|' || p_poll || '|' || ip, 'sha256'), 'hex') into h
  from public.quick_poll_salt s;

  if not exists (select 1 from public.quick_poll_votes v where v.poll_id = p_poll and v.voter = p_voter)
     and (select count(*) from public.quick_poll_votes v where v.poll_id = p_poll and v.ip_hash = h) >= 30 then
    raise exception 'quick poll limit';
  end if;

  insert into public.quick_poll_votes as v (poll_id, voter, choice, ip_hash)
  values (p_poll, p_voter, p_choice, h)
  on conflict (poll_id, voter) do update set choice = excluded.choice;

  return query select * from public.quick_poll_results(p_poll);
end;
$$;

revoke execute on function public.quick_poll_results(text) from public;
revoke execute on function public.cast_quick_vote(text, text, uuid) from public;
grant execute on function public.quick_poll_results(text) to anon, authenticated;
grant execute on function public.cast_quick_vote(text, text, uuid) to anon, authenticated;
