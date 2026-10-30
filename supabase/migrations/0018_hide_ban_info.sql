-- 이용 제한 정보(기간·사유)를 본인과 운영자만 볼 수 있게
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0017 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 회원 정보(profiles)는 닉네임·칭호처럼 모두에게 보이는 정보라 누구나 읽을 수 있는데,
-- banned_until·ban_reason 까지 같이 읽혀서 다른 사람의 제한 사유를 볼 수 있었음.
-- 이 두 칸은 읽기 권한을 빼고, 아래 함수로만 꺼내 봄.
-- ⚠️ 사이트 코드가 profiles 를 "*" 대신 칸 이름으로 읽도록 바뀐 다음(배포 후)에 실행해야 함.

-- 내 이용 제한 (로그인 안 했으면 빈 결과)
create or replace function public.my_ban()
returns table (banned_until timestamptz, ban_reason text)
language sql
stable
security definer set search_path = ''
as $$
  select p.banned_until, p.ban_reason from public.profiles p where p.id = auth.uid();
$$;

-- 운영자: 지금 이용 제한 중인 회원 (운영자가 아니면 빈 결과)
create or replace function public.admin_bans()
returns table (id uuid, banned_until timestamptz, ban_reason text)
language sql
stable
security definer set search_path = ''
as $$
  select p.id, p.banned_until, p.ban_reason from public.profiles p
  where public.is_admin() and p.banned_until > now();
$$;

revoke execute on function public.my_ban() from public, anon;
revoke execute on function public.admin_bans() from public, anon;
grant execute on function public.my_ban() to authenticated;
grant execute on function public.admin_bans() to authenticated;

-- 공개 칸만 읽기 허용
revoke select on public.profiles from anon, authenticated;
grant select (id, nickname, created_at, is_admin, collected_count, contributed_count, contributor_rank, nickname_set)
  on public.profiles to anon, authenticated;
