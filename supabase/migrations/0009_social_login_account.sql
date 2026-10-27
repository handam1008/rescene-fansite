-- 소셜 로그인(구글·카카오) · 닉네임 정하기 · 회원 탈퇴
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0008 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.

-- ───────────────────────── 닉네임 ─────────────────────────
-- 소셜 로그인은 닉네임을 받지 않으므로 임시 닉네임(user_ + 12자리)으로 만들고, 처음 로그인할 때 정하게 함
alter table public.profiles add column if not exists nickname_set boolean not null default true;

-- 가입할 때 프로필 만들기: 받은 닉네임이 2~20자가 아니거나 이미 있으면 임시 닉네임으로
-- (예전에는 닉네임이 겹치면 가입 자체가 실패했음)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  wanted text := btrim(coalesce(new.raw_user_meta_data ->> 'nickname', ''));
  ok boolean := char_length(wanted) between 2 and 20
    and not exists (select 1 from public.profiles where nickname = wanted);
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

-- 회원이 닉네임을 바꾸면 "정함"으로 표시 (회원은 nickname 칸만 바꿀 수 있음, 0003)
create or replace function public.mark_nickname_set()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.nickname_set := true;
  return new;
end;
$$;

drop trigger if exists profiles_nickname_set on public.profiles;
create trigger profiles_nickname_set
  before update of nickname on public.profiles
  for each row when (old.nickname is distinct from new.nickname)
  execute function public.mark_nickname_set();

-- ───────────────────────── 회원 탈퇴 ─────────────────────────
-- 본인 계정 삭제. 프로필·글·댓글·추천·신고·포카 인증이 함께 지워짐(on delete cascade).
-- 도감에 공개된 사진은 남고 제공자 표시만 지워짐(on delete set null).
-- 저장소의 사진 파일은 사이트 서버가 먼저 지움 (src/app/account/actions.ts)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
