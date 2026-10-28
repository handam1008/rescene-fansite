-- 방문자 수: 화면 위쪽의 "오늘 · 누적" 숫자
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0012 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 한 브라우저는 하루(한국 시간)에 한 번만 셉니다 (브라우저가 오늘 셌는지 기억함).
-- 누가 왔는지(IP·계정)는 저장하지 않고 날짜별 숫자만 저장합니다.

create table if not exists public.site_visits (
  day date primary key,
  visitors integer not null default 0
);

-- 표를 직접 읽고 쓰지 못하게 막고, 아래 두 함수로만 씀
alter table public.site_visits enable row level security;

-- 오늘 방문 1 더하고 오늘·누적 숫자 돌려줌
create or replace function public.record_visit()
returns table (today integer, total bigint)
language plpgsql
security definer set search_path = ''
as $$
declare
  d date := (now() at time zone 'Asia/Seoul')::date;
begin
  insert into public.site_visits as v (day, visitors) values (d, 1)
  on conflict (day) do update set visitors = v.visitors + 1;
  return query
    select (select s.visitors from public.site_visits s where s.day = d),
           (select coalesce(sum(s.visitors), 0) from public.site_visits s)::bigint;
end;
$$;

-- 숫자만 보기 (오늘 이미 센 브라우저)
create or replace function public.visit_stats()
returns table (today integer, total bigint)
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((select s.visitors from public.site_visits s where s.day = (now() at time zone 'Asia/Seoul')::date), 0),
         (select coalesce(sum(s.visitors), 0) from public.site_visits s)::bigint;
$$;

grant execute on function public.record_visit() to anon, authenticated;
grant execute on function public.visit_stats() to anon, authenticated;
