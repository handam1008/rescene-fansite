-- 퀴즈 배틀 칭호와 명예의 전당
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0020 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 이번 주 랭킹 1·2·3등과 역대 최고 기록(명예의 전당 1등)을 회원 정보에 저장해서 닉네임 옆 칭호로 보여줌.
-- 기록이 새로 남을 때마다 다시 계산. 주간 칭호는 그 주에만 보이게 "어느 주의 순위인지"도 같이 저장
-- (월요일이 되면 화면에서 지난주 칭호를 숨기므로, 새 주 첫 기록 전까지 비어 보임).
-- 명예의 전당은 주가 바뀌어도 그대로이고, 누가 더 좋은 기록을 내면 바뀜.

alter table public.profiles add column if not exists quiz_rank smallint;
alter table public.profiles add column if not exists quiz_rank_week date;
alter table public.profiles add column if not exists quiz_fame boolean not null default false;

-- 공개 칸에 추가 (0018 에서 공개 칸만 읽게 바꿈). 본인이 바꿀 수는 없음 (닉네임만 수정 가능)
grant select (quiz_rank, quiz_rank_week, quiz_fame) on public.profiles to anon, authenticated;

create or replace function public.recalc_quiz_titles()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  week_start date := (date_trunc('week', now() at time zone 'Asia/Seoul'))::date;
begin
  -- 이번 주 1·2·3등 (회원마다 가장 좋은 기록: 맞힌 개수 많은 순, 같으면 빠른 순)
  update public.profiles set quiz_rank = null, quiz_rank_week = null where quiz_rank is not null;
  with week as (
    select distinct on (q.user_id) q.user_id, q.score, q.ms
    from public.quiz_scores q
    where q.created_at >= week_start::timestamp at time zone 'Asia/Seoul'
    order by q.user_id, q.score desc, q.ms asc
  ), ranked as (
    select w.user_id, row_number() over (order by w.score desc, w.ms asc) as rnk from week w
  )
  update public.profiles p set quiz_rank = r.rnk, quiz_rank_week = week_start
  from ranked r where r.user_id = p.id and r.rnk <= 3;

  -- 명예의 전당 1등: 역대 최고 기록 (같으면 먼저 낸 사람)
  update public.profiles set quiz_fame = false where quiz_fame;
  update public.profiles p set quiz_fame = true
  where p.id = (select q.user_id from public.quiz_scores q order by q.score desc, q.ms asc, q.created_at asc limit 1);
end;
$$;

revoke execute on function public.recalc_quiz_titles() from public, anon, authenticated;

create or replace function public.refresh_quiz_titles()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.recalc_quiz_titles();
  return null;
end;
$$;

drop trigger if exists quiz_scores_titles on public.quiz_scores;
create trigger quiz_scores_titles
  after insert or delete on public.quiz_scores
  for each statement execute function public.refresh_quiz_titles();

-- 명예의 전당: 역대 기록 순위 (회원마다 가장 좋은 기록 하나, 그 기록을 낸 날짜와 함께)
create or replace function public.quiz_hall_of_fame(p_limit int default 5)
returns table (user_id uuid, name text, score smallint, ms integer, achieved_at timestamptz)
language sql
stable
security definer set search_path = ''
as $$
  with best as (
    select distinct on (q.user_id) q.user_id, q.score, q.ms, q.created_at
    from public.quiz_scores q
    order by q.user_id, q.score desc, q.ms asc, q.created_at asc
  )
  select b.user_id, coalesce(nullif(btrim(p.nickname), ''), '리마인')::text, b.score, b.ms, b.created_at
  from best b join public.profiles p on p.id = b.user_id
  order by b.score desc, b.ms asc, b.created_at asc
  limit least(greatest(p_limit, 1), 20);
$$;

revoke execute on function public.quiz_hall_of_fame(int) from public;
grant execute on function public.quiz_hall_of_fame(int) to anon, authenticated;

-- 지금까지 기록으로 한 번 계산
select public.recalc_quiz_titles();
