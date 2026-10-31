-- 리센느 퀴즈 배틀 리더보드
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0018 을 먼저 실행한 상태여야 하고(0017 의 IP 해시 비밀값을 같이 씀), 여러 번 실행해도 안전합니다.
--
-- 퀴즈를 다 풀면 이름·점수·걸린 시간을 기록하고, 이번 주(월요일 0시, 한국 시간부터) 순위를 보여줌.
-- 로그인 없이 쓰는 놀이라 이름은 각자 정한 별명이고, 같은 접속(IP)·같은 이름은 가장 좋은 기록 하나만 순위에 올라감.
-- 점수는 각자 화면에서 계산하므로, 말이 안 되는 기록(10문제를 8초 안에 등)만 걸러냄. 같은 IP 는 하루 30번까지.
-- IP 는 그대로 저장하지 않고 비밀값을 섞은 해시만 저장합니다.

create table if not exists public.quiz_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 12),
  score smallint not null check (score between 0 and 10),
  ms integer not null check (ms between 8000 and 150000),
  mode text not null check (mode in ('duel', 'solo')),
  won boolean,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_scores_rank_idx on public.quiz_scores (created_at desc, score desc, ms);
create index if not exists quiz_scores_ip_idx on public.quiz_scores (ip_hash, created_at desc);

alter table public.quiz_scores enable row level security;
revoke all on public.quiz_scores from anon, authenticated;

-- 기록 남기기
create or replace function public.submit_quiz_score(p_name text, p_score int, p_ms int, p_mode text, p_won boolean default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(headers ->> 'cf-connecting-ip', btrim(split_part(headers ->> 'x-forwarded-for', ',', 1)), 'unknown');
  h text;
begin
  select encode(extensions.digest(s.salt || '|quiz|' || ip, 'sha256'), 'hex') into h from public.quick_poll_salt s;
  if (select count(*) from public.quiz_scores q where q.ip_hash = h and q.created_at > now() - interval '1 day') >= 30 then
    raise exception 'quiz score limit';
  end if;
  insert into public.quiz_scores (name, score, ms, mode, won, ip_hash)
  values (btrim(p_name), p_score, p_ms, p_mode, case when p_mode = 'duel' then p_won end, h);
end;
$$;

-- 이번 주 순위 (같은 IP·같은 이름은 가장 좋은 기록 하나) · 맞힌 개수 많은 순, 같으면 빠른 순
create or replace function public.quiz_leaderboard(p_limit int default 10)
returns table (name text, score smallint, ms integer, wins bigint)
language sql
stable
security definer set search_path = ''
as $$
  with week as (
    select * from public.quiz_scores q
    where q.created_at >= date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
  ),
  best as (
    select distinct on (w.ip_hash, w.name) w.ip_hash, w.name, w.score, w.ms
    from week w
    order by w.ip_hash, w.name, w.score desc, w.ms asc
  )
  select b.name, b.score, b.ms,
         (select count(*) from week w where w.ip_hash = b.ip_hash and w.name = b.name and w.won) as wins
  from best b
  order by b.score desc, b.ms asc
  limit least(greatest(p_limit, 1), 50);
$$;

revoke execute on function public.submit_quiz_score(text, int, int, text, boolean) from public;
revoke execute on function public.quiz_leaderboard(int) from public;
grant execute on function public.submit_quiz_score(text, int, int, text, boolean) to anon, authenticated;
grant execute on function public.quiz_leaderboard(int) to anon, authenticated;
