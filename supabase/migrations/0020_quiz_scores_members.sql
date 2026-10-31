-- 퀴즈 배틀 랭킹을 로그인한 회원만 올라가게
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0019 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 기록에 회원 계정을 붙이고, 랭킹에는 회원 닉네임으로 표시 (남의 이름을 쓰는 걸 막음).
-- 로그인하지 않은 사람은 퀴즈·대결은 그대로 할 수 있지만 기록은 남지 않음.
-- 이용 제한 중인 회원은 기록을 남길 수 없음. 같은 회원은 하루 50번까지. 탈퇴하면 기록도 같이 지워짐.

alter table public.quiz_scores add column if not exists user_id uuid references public.profiles (id) on delete cascade;
-- 0019 때 남은 비회원 기록은 랭킹에 쓸 수 없어서 지움
delete from public.quiz_scores where user_id is null;
alter table public.quiz_scores alter column user_id set not null;
alter table public.quiz_scores alter column ip_hash drop not null;

create index if not exists quiz_scores_user_idx on public.quiz_scores (user_id, created_at desc);

drop function if exists public.submit_quiz_score(text, int, int, text, boolean);

-- 기록 남기기 (로그인한 회원만)
create or replace function public.submit_quiz_score(p_score int, p_ms int, p_mode text, p_won boolean default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  nick text;
begin
  if me is null then
    raise exception 'login required';
  end if;
  if public.is_banned() then
    raise exception 'banned';
  end if;
  if (select count(*) from public.quiz_scores q where q.user_id = me and q.created_at > now() - interval '1 day') >= 50 then
    raise exception 'quiz score limit';
  end if;
  select coalesce(nullif(btrim(p.nickname), ''), '리마인') into nick from public.profiles p where p.id = me;
  insert into public.quiz_scores (user_id, name, score, ms, mode, won)
  values (me, left(coalesce(nick, '리마인'), 12), p_score, p_ms, p_mode, case when p_mode = 'duel' then p_won end);
end;
$$;

-- 이번 주 순위: 회원마다 가장 좋은 기록 하나, 닉네임은 지금 닉네임으로
drop function if exists public.quiz_leaderboard(int);
create or replace function public.quiz_leaderboard(p_limit int default 10)
returns table (user_id uuid, name text, score smallint, ms integer, wins bigint)
language sql
stable
security definer set search_path = ''
as $$
  with week as (
    select * from public.quiz_scores q
    where q.created_at >= date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
  ),
  best as (
    select distinct on (w.user_id) w.user_id, w.score, w.ms
    from week w
    order by w.user_id, w.score desc, w.ms asc
  )
  select b.user_id, coalesce(nullif(btrim(p.nickname), ''), '리마인')::text, b.score, b.ms,
         (select count(*) from week w where w.user_id = b.user_id and w.won)
  from best b join public.profiles p on p.id = b.user_id
  order by b.score desc, b.ms asc
  limit least(greatest(p_limit, 1), 50);
$$;

revoke execute on function public.submit_quiz_score(int, int, text, boolean) from public, anon;
revoke execute on function public.quiz_leaderboard(int) from public;
grant execute on function public.submit_quiz_score(int, int, text, boolean) to authenticated;
grant execute on function public.quiz_leaderboard(int) to anon, authenticated;
