-- 퀴즈 배틀 대전 기록 (운영자만 봄)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0017 ~ 0020 을 먼저 실행한 상태여야 하고(0017 의 IP 해시 비밀값을 같이 씀), 여러 번 실행해도 안전합니다.
--
-- 랭킹(quiz_scores, 회원만)과 따로, 비회원을 포함한 모든 판을 남겨서 운영자 화면 "퀴즈" 탭에서 봄.
-- 대결이면 두 사람이 각자 자기 판을 남김 (상대 이름·승패 포함). 이름은 각자 정한 별명, 회원이면 계정도 같이 저장.
-- 같은 접속(IP)은 하루 200판까지. IP 는 비밀값을 섞은 해시만 저장합니다. 회원이 탈퇴하면 계정 연결만 끊기고 별명 기록은 남음.

create table if not exists public.quiz_games (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 12),
  mode text not null check (mode in ('duel', 'solo')),
  score smallint not null check (score between 0 and 10),
  ms integer not null check (ms between 0 and 150000),
  opponent text check (opponent is null or char_length(opponent) <= 12),
  opponent_score smallint check (opponent_score is null or opponent_score between 0 and 10),
  result text check (result is null or result in ('win', 'lose', 'draw', 'forfeit', 'unknown')),
  locale text check (locale is null or locale in ('ko', 'ja', 'en')),
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists quiz_games_recent_idx on public.quiz_games (created_at desc);
create index if not exists quiz_games_ip_idx on public.quiz_games (ip_hash, created_at desc);

alter table public.quiz_games enable row level security;
revoke all on public.quiz_games from anon, authenticated;

-- 한 판 기록 (누구나, 로그인했으면 계정도)
create or replace function public.log_quiz_game(
  p_name text, p_mode text, p_score int, p_ms int,
  p_opponent text default null, p_opponent_score int default null, p_result text default null, p_locale text default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(headers ->> 'cf-connecting-ip', btrim(split_part(headers ->> 'x-forwarded-for', ',', 1)), 'unknown');
  h text;
begin
  select encode(extensions.digest(s.salt || '|game|' || ip, 'sha256'), 'hex') into h from public.quick_poll_salt s;
  if (select count(*) from public.quiz_games g where g.ip_hash = h and g.created_at > now() - interval '1 day') >= 200 then
    raise exception 'quiz game limit';
  end if;
  insert into public.quiz_games (user_id, name, mode, score, ms, opponent, opponent_score, result, locale, ip_hash)
  values (
    auth.uid(), left(btrim(p_name), 12), p_mode, p_score, p_ms,
    case when p_mode = 'duel' then nullif(left(btrim(coalesce(p_opponent, '')), 12), '') end,
    case when p_mode = 'duel' then p_opponent_score end,
    case when p_mode = 'duel' then coalesce(p_result, 'unknown') end,
    p_locale, h
  );
end;
$$;

-- 운영자: 최근 대전 기록 (운영자가 아니면 빈 결과)
create or replace function public.admin_quiz_games(p_limit int default 100)
returns table (
  id bigint, created_at timestamptz, name text, nickname text, mode text, score smallint, ms integer,
  opponent text, opponent_score smallint, result text, locale text
)
language sql
stable
security definer set search_path = ''
as $$
  select g.id, g.created_at, g.name, p.nickname, g.mode, g.score, g.ms, g.opponent, g.opponent_score, g.result, g.locale
  from public.quiz_games g left join public.profiles p on p.id = g.user_id
  where public.is_admin()
  order by g.created_at desc
  limit least(greatest(p_limit, 1), 300);
$$;

-- 운영자: 요약 숫자 (오늘·전체 판 수, 대결 수, 회원이 한 판 수)
create or replace function public.admin_quiz_stats()
returns table (today bigint, total bigint, duels bigint, member_games bigint, avg_score numeric)
language sql
stable
security definer set search_path = ''
as $$
  select
    count(*) filter (where g.created_at >= date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'),
    count(*),
    count(*) filter (where g.mode = 'duel'),
    count(*) filter (where g.user_id is not null),
    round(avg(g.score), 1)
  from public.quiz_games g
  where public.is_admin();
$$;

revoke execute on function public.log_quiz_game(text, text, int, int, text, int, text, text) from public;
revoke execute on function public.admin_quiz_games(int) from public, anon;
revoke execute on function public.admin_quiz_stats() from public, anon;
grant execute on function public.log_quiz_game(text, text, int, int, text, int, text, text) to anon, authenticated;
grant execute on function public.admin_quiz_games(int) to authenticated;
grant execute on function public.admin_quiz_stats() to authenticated;
