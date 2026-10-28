-- 닉네임: 한글·영문·숫자만 (띄어쓰기·특수문자·보이지 않는 글자 금지)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0010 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 이유: "류한담ㅤ"처럼 보이지 않는 한글 채움 문자(U+3164)를 붙여 중복 검사를 피하고 운영자를 사칭한 경우가 있었음.
-- 허용: 완성형 한글(가-힣), 한글 자모(ㄱ-ㅎ, ㅏ-ㅣ), 영문, 숫자. 2~20자.
-- 예외: 가입 때 자동으로 붙는 임시 닉네임 user_ + 12자리(0009)

create or replace function public.nickname_format_ok(n text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select n ~ '^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]{2,20}$';
$$;

-- 닉네임 "정함" 표시는 회원이 직접 바꿀 때만 (0009 의 트리거는 DB 정리로 바꿔도 "정함"이 돼 버렸음)
create or replace function public.mark_nickname_set()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    new.nickname_set := true;
  end if;
  return new;
end;
$$;

-- 지금 규칙에 맞지 않는 닉네임은 임시 닉네임으로 바꾸고, 다음 접속 때 새로 정하게 함 (nickname_set = false)
update public.profiles
set nickname = 'user_' || left(replace(id::text, '-', ''), 12), nickname_set = false
where not public.nickname_format_ok(nickname)
  and nickname !~ '^user_[0-9a-f]{12}$';

-- 임시 닉네임인 회원은 모두 "아직 안 정함"으로 (위 정리로 바뀐 회원 포함)
update public.profiles set nickname_set = false where nickname ~ '^user_[0-9a-f]{12}$' and nickname_set;

alter table public.profiles drop constraint if exists profiles_nickname_charset;
alter table public.profiles add constraint profiles_nickname_charset
  check (public.nickname_format_ok(nickname) or nickname ~ '^user_[0-9a-f]{12}$');

-- 가입·닉네임 변경 화면의 미리 확인도 같은 규칙으로
create or replace function public.nickname_available(n text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select public.nickname_format_ok(n)
    and lower(n) !~ '(운영자|관리자|admin)'
    and not exists (
      select 1 from public.profiles
      where lower(btrim(nickname)) = lower(n) and id is distinct from auth.uid()
    );
$$;

grant execute on function public.nickname_available(text) to anon, authenticated;

-- 가입할 때: 받은 닉네임이 규칙에 안 맞거나 겹치면 임시 닉네임으로 (0009·0010 과 같은 흐름)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  wanted text := btrim(coalesce(new.raw_user_meta_data ->> 'nickname', ''));
  ok boolean := public.nickname_format_ok(wanted)
    and lower(wanted) !~ '(운영자|관리자|admin)'
    and not exists (select 1 from public.profiles where lower(btrim(nickname)) = lower(wanted));
begin
  insert into public.profiles (id, nickname, nickname_set)
  values (
    new.id,
    case when ok then wanted else 'user_' || left(replace(new.id::text, '-', ''), 12) end,
    ok
  );
  return new;
end;
$$;

-- 회원이 직접 바꿀 때 (DB 에서 한 번 더 막음)
create or replace function public.guard_nickname()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.nickname := btrim(new.nickname);
  if current_user = 'authenticated' and (
    not public.nickname_format_ok(new.nickname) or lower(new.nickname) ~ '(운영자|관리자|admin)'
  ) then
    raise exception '닉네임은 한글·영문·숫자 2~20자만 쓸 수 있어요';
  end if;
  return new;
end;
$$;
