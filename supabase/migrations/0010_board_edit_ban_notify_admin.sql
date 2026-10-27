-- 글 수정 · 추천 고정 · 이용 제한 · 댓글 알림 · 운영자 관리 · 닉네임 중복 방지
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0009 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.

-- ───────────────────────── 이용 제한 ─────────────────────────
-- banned_until 이 지금보다 뒤면 글·댓글·추천·신고·포카 인증을 못 함 (읽기는 됨)
alter table public.profiles add column if not exists banned_until timestamptz;
alter table public.profiles add column if not exists ban_reason text;
alter table public.profiles drop constraint if exists profiles_ban_reason_len;
alter table public.profiles add constraint profiles_ban_reason_len check (char_length(ban_reason) <= 200);

create or replace function public.is_banned()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((select banned_until > now() from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_banned() to anon, authenticated;

drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts" on public.posts
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not public.is_banned()
    and not exists (
      select 1 from unnest(image_paths) as p(path)
      where p.path not like auth.uid()::text || '/%'
    )
  );

drop policy if exists "users insert own comments" on public.comments;
create policy "users insert own comments" on public.comments
  for insert to authenticated
  with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "users report" on public.post_reports;
create policy "users report" on public.post_reports
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not public.is_banned()
    and exists (select 1 from public.posts p where p.id = post_id and p.hidden_at is null and p.user_id <> auth.uid())
  );

drop policy if exists "users submit own proof" on public.photocard_collections;
create policy "users submit own proof" on public.photocard_collections
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not public.is_banned()
    and status = 'pending'
    and reviewed_at is null
    and photo_path like auth.uid()::text || '/%'
  );

-- ───────────────────────── 추천·비추천: 한 번 누르면 끝 ─────────────────────────
-- 바꾸기·취소를 없앰 (몰래 바꿔 가며 숫자를 조작하지 못하게)
drop policy if exists "users change vote" on public.post_votes;
drop policy if exists "users cancel vote" on public.post_votes;
revoke update, delete on public.post_votes from anon, authenticated;

drop policy if exists "users vote" on public.post_votes;
create policy "users vote" on public.post_votes
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not public.is_banned()
    and exists (select 1 from public.posts p where p.id = post_id and p.hidden_at is null and p.user_id <> auth.uid())
  );

-- ───────────────────────── 글 수정 ─────────────────────────
alter table public.posts add column if not exists edited_at timestamptz;

drop policy if exists "users edit own posts" on public.posts;
create policy "users edit own posts" on public.posts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and not public.is_banned()
    and not exists (
      select 1 from unnest(image_paths) as p(path)
      where p.path not like auth.uid()::text || '/%'
    )
  );

-- 글쓴이는 제목·내용·사진·말머리만 바꿀 수 있음. 추천 수·조회수·숨김 같은 칸은 운영자와 DB 자동 처리만.
-- (current_user 가 authenticated 이면 사이트 회원이 직접 보낸 수정, 그 외는 DB 함수·트리거의 수정)
create or replace function public.guard_post_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    if new.user_id is distinct from old.user_id
      or new.created_at is distinct from old.created_at
      or new.view_count is distinct from old.view_count
      or new.like_count is distinct from old.like_count
      or new.dislike_count is distinct from old.dislike_count
      or new.report_count is distinct from old.report_count
      or new.hidden_at is distinct from old.hidden_at
      or new.hidden_reason is distinct from old.hidden_reason
      or new.restored_at is distinct from old.restored_at then
      raise exception '바꿀 수 없는 칸이에요';
    end if;
  end if;
  if new.title is distinct from old.title or new.content is distinct from old.content
    or new.image_paths is distinct from old.image_paths then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_guard_update on public.posts;
create trigger posts_guard_update
  before update on public.posts
  for each row execute function public.guard_post_update();

-- ───────────────────────── 댓글 알림 ─────────────────────────
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('comment')),
  post_id bigint references public.posts (id) on delete cascade,
  comment_id bigint references public.comments (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "own notifications" on public.notifications;
create policy "own notifications" on public.notifications
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications" on public.notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own notifications" on public.notifications;
create policy "delete own notifications" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

-- 알림은 "읽음" 표시만 바꿀 수 있음
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- 내 글에 다른 사람이 댓글을 달면 알림
create or replace function public.notify_comment()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  author uuid;
begin
  select user_id into author from public.posts where id = new.post_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications (user_id, type, post_id, comment_id, actor_id)
    values (author, 'comment', new.post_id, new.id, new.user_id);
  end if;
  return null;
end;
$$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_comment();

-- ───────────────────────── 운영자: 운영자 지정 · 이용 제한 ─────────────────────────
-- 회원은 프로필의 닉네임만 바꿀 수 있어서(0003), 운영자 작업은 아래 함수로만 함
create or replace function public.admin_set_admin(target uuid, make_admin boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception '운영자만 할 수 있어요'; end if;
  if target = auth.uid() and not make_admin then raise exception '본인의 운영자 권한은 해제할 수 없어요'; end if;
  update public.profiles set is_admin = make_admin where id = target;
end;
$$;

create or replace function public.admin_set_ban(target uuid, until timestamptz, reason text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception '운영자만 할 수 있어요'; end if;
  if exists (select 1 from public.profiles where id = target and is_admin) then
    raise exception '운영자는 이용 제한할 수 없어요';
  end if;
  update public.profiles
  set banned_until = until, ban_reason = case when until is null then null else left(reason, 200) end
  where id = target;
end;
$$;

revoke execute on function public.admin_set_admin(uuid, boolean) from public, anon;
revoke execute on function public.admin_set_ban(uuid, timestamptz, text) from public, anon;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.admin_set_ban(uuid, timestamptz, text) to authenticated;

-- ───────────────────────── 닉네임 중복 방지 ─────────────────────────
-- 대소문자·앞뒤 공백만 다른 닉네임도 같은 것으로 봄 (예: Rescene / rescene)
create unique index if not exists profiles_nickname_lower_key on public.profiles (lower(btrim(nickname)));

-- 가입·닉네임 변경 화면에서 미리 확인용 (운영자 사칭 단어도 막음)
create or replace function public.nickname_available(n text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select char_length(btrim(n)) between 2 and 20
    and lower(btrim(n)) !~ '^user_'
    and lower(btrim(n)) !~ '(운영자|관리자|admin)'
    and not exists (
      select 1 from public.profiles
      where lower(btrim(nickname)) = lower(btrim(n)) and id is distinct from auth.uid()
    );
$$;

grant execute on function public.nickname_available(text) to anon, authenticated;

-- 가입할 때도 같은 규칙으로 확인 (겹치면 임시 닉네임으로 만들고 첫 로그인 때 정하게 함, 0009)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  wanted text := btrim(coalesce(new.raw_user_meta_data ->> 'nickname', ''));
  ok boolean := char_length(wanted) between 2 and 20
    and lower(wanted) !~ '^user_'
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

-- 닉네임 칸 자체에도 같은 규칙 (회원이 직접 바꿀 때). 임시 닉네임(user_…)은 가입 함수만 만들 수 있음
create or replace function public.guard_nickname()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.nickname := btrim(new.nickname);
  if current_user = 'authenticated' and (
    lower(new.nickname) ~ '^user_' or lower(new.nickname) ~ '(운영자|관리자|admin)'
  ) then
    raise exception '쓸 수 없는 닉네임이에요';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_nickname on public.profiles;
create trigger profiles_guard_nickname
  before update of nickname on public.profiles
  for each row execute function public.guard_nickname();
