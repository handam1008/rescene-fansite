-- 다 같이 채우는 포카 도감: 사진 공개 동의 · 첫 제공자 · 기여 랭킹
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0005 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 도감 이미지는 처음엔 모두 비어 있고, 회원이 직접 찍은 인증 사진(공개 동의한 것)으로 채워집니다.
-- 빈 카드를 처음 채운 회원이 "첫 제공자"로 남고, 첫 제공 장수로 기여 랭킹을 매깁니다.

-- ───────────────────────── 인증 사진 공개 동의 ─────────────────────────
-- true 면 승인될 때 도감 이미지로 공개될 수 있음 (작게 줄인 "-share" 사본을 씀)
alter table public.photocard_collections add column if not exists share_image boolean not null default false;

-- ───────────────────────── 첫 제공자 ─────────────────────────
-- 사진이 나중에 교체돼도 첫 제공자는 그대로 (랭킹 기준)
alter table public.photocard_catalog add column if not exists first_contributor uuid
  references public.profiles (id) on delete set null;
alter table public.photocard_catalog add column if not exists filled_at timestamptz;

-- 이미 회원 사진으로 채워진 카드가 있으면 그 회원을 첫 제공자로
update public.photocard_catalog
set first_contributor = image_contributor, filled_at = coalesce(filled_at, now())
where first_contributor is null and image_contributor is not null;

create index if not exists photocard_catalog_filled_idx on public.photocard_catalog (filled_at desc) where filled_at is not null;

-- ───────────────────────── 기여 랭킹 ─────────────────────────
-- 프로필에 첫 제공 장수와 순위를 저장 (닉네임 옆 칭호에 씀). 본인이 바꿀 수 없음(0003 에서 닉네임만 수정 허용)
alter table public.profiles add column if not exists contributed_count integer not null default 0;
alter table public.profiles add column if not exists contributor_rank integer;

-- 순위: 첫 제공 장수가 많은 순, 같으면 그 장수에 먼저 도달한 사람이 위
create or replace function public.recalc_contributor_ranks()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  with s as (
    select first_contributor as id, count(*)::int as cnt, max(filled_at) as last_at
    from public.photocard_catalog
    where first_contributor is not null
    group by first_contributor
  ), r as (
    select id, cnt, (row_number() over (order by cnt desc, last_at asc nulls last))::int as rnk from s
  )
  update public.profiles p
  set contributed_count = coalesce(r.cnt, 0), contributor_rank = r.rnk
  from public.profiles p2
  left join r on r.id = p2.id
  where p.id = p2.id
    and (p.contributed_count <> coalesce(r.cnt, 0) or p.contributor_rank is distinct from r.rnk);
end;
$$;

revoke execute on function public.recalc_contributor_ranks() from public, anon, authenticated;

create or replace function public.refresh_contributor_ranks()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.recalc_contributor_ranks();
  return null;
end;
$$;

drop trigger if exists photocard_catalog_contributor_ranks on public.photocard_catalog;
create trigger photocard_catalog_contributor_ranks
  after insert or delete or update of first_contributor on public.photocard_catalog
  for each statement execute function public.refresh_contributor_ranks();

select public.recalc_contributor_ranks();
