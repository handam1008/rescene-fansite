-- 문의: 회원이 운영자에게 건의·신고·오류 제보를 보내고, 운영자가 답변
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0014 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 문의는 보낸 회원 본인과 운영자만 볼 수 있습니다.
-- 운영자가 답변하면 보낸 회원에게 알림이 가고, 탈퇴하면 문의도 함께 지워집니다.

create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category text not null check (category in ('suggestion', 'report', 'bug', 'other')),
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  reply text check (reply is null or char_length(btrim(reply)) between 1 and 2000),
  replied_at timestamptz,
  -- 답변 없이 처리 끝 (도배·이미 처리한 일 등)
  closed_at timestamptz
);

create index if not exists inquiries_user_idx on public.inquiries (user_id, created_at desc);
create index if not exists inquiries_open_idx on public.inquiries (created_at desc) where replied_at is null and closed_at is null;

alter table public.inquiries enable row level security;

drop policy if exists "see own inquiries" on public.inquiries;
create policy "see own inquiries" on public.inquiries
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

-- 하루(24시간)에 5개까지 (도배 막기). 이용 제한 중이어도 보낼 수 있음 (제한에 대한 이의 제기용)
drop policy if exists "send inquiries" on public.inquiries;
create policy "send inquiries" on public.inquiries
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and (
      select count(*) from public.inquiries i
      where i.user_id = auth.uid() and i.created_at > now() - interval '1 day'
    ) < 5
  );

drop policy if exists "admins answer inquiries" on public.inquiries;
create policy "admins answer inquiries" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete inquiries" on public.inquiries;
create policy "admins delete inquiries" on public.inquiries
  for delete to authenticated using (public.is_admin());

-- 회원은 분류·내용만 넣을 수 있고 (보낸 사람·시각은 자동), 운영자는 답변·처리 칸만 바꿀 수 있음
revoke all on public.inquiries from anon;
revoke insert, update on public.inquiries from authenticated;
grant insert (category, content) on public.inquiries to authenticated;
grant update (reply, replied_at, closed_at) on public.inquiries to authenticated;

-- ───────────────────────── 답변 알림 ─────────────────────────
-- 알림 종류에 'inquiry' 추가 (0010 은 'comment' 만)
do $$
declare
  c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.notifications'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%type%'
  loop
    execute format('alter table public.notifications drop constraint %I', c);
  end loop;
end;
$$;
alter table public.notifications add constraint notifications_type_check check (type in ('comment', 'inquiry'));
alter table public.notifications add column if not exists inquiry_id bigint references public.inquiries (id) on delete cascade;

-- 운영자가 처음 답변을 달면 보낸 회원에게 알림 (답변을 고칠 때는 다시 보내지 않음)
create or replace function public.notify_inquiry_reply()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.reply is null and new.reply is not null and new.user_id is distinct from auth.uid() then
    insert into public.notifications (user_id, type, inquiry_id, actor_id)
    values (new.user_id, 'inquiry', new.id, auth.uid());
  end if;
  return null;
end;
$$;

drop trigger if exists inquiries_notify_reply on public.inquiries;
create trigger inquiries_notify_reply
  after update of reply on public.inquiries
  for each row execute function public.notify_inquiry_reply();
