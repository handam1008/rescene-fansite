-- 영상: 공식·팬 유튜브 채널 목록 (새 영상은 각 채널의 공개 RSS 에서 자동으로 가져옴)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0014 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 운영자가 /admin 의 "영상 채널" 탭에서 채널 주소를 넣거나 지울 수 있습니다.
-- 아래 처음 목록: 공식 2개 + 유튜브 채널 검색("리센느", "리센느 팬")으로 찾은 리센느 팬 채널 (2026-10-28 기준)

create table if not exists public.video_channels (
  channel_id text primary key check (channel_id ~ '^UC[A-Za-z0-9_-]{22}$'),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  kind text not null check (kind in ('official', 'fan')),
  created_at timestamptz not null default now()
);

alter table public.video_channels enable row level security;

drop policy if exists "video channels are public" on public.video_channels;
create policy "video channels are public" on public.video_channels
  for select using (true);

drop policy if exists "admins manage video channels" on public.video_channels;
create policy "admins manage video channels" on public.video_channels
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.video_channels (channel_id, name, kind) values
  ('UCtKtCiaWRz-d3EZn2xd1mdA', 'RESCENE', 'official'),
  ('UCWpY0eSJtyO-qNAPbKFRSSg', '안원잘부', 'official'),
  ('UCkQ_VWRV5xw4HJOQqaucIHg', '리센느서치P', 'fan'),
  ('UCTTIl4ShyX5JcsIsZCSizyQ', '리센느도감', 'fan'),
  ('UCcIxVD__q-WCboXOztNWaWQ', '리센느상사', 'fan'),
  ('UCtuvdF8hRgj9jMG3nXouOnw', '리센느입니다', 'fan'),
  ('UCfd9mp2QKKprT1Iwt_2Jhng', '르센느 아니고 리센느', 'fan'),
  ('UCW5BnP05WrO2FFQTIcc0g7A', '원이의 리센느 일기장', 'fan'),
  ('UCPrgfKJUFewOgizNuYlYoGA', '리센느 헤르츠', 'fan'),
  ('UC-ImGRsWHMVbrL3lG1QFDCw', '리센느집합소', 'fan'),
  ('UCgsYHr63Bga0z6uz88mnp3A', '오늘도 리센느', 'fan'),
  ('UC5YVF3-y6Mi6d1KbpgY7wrQ', '리센느공방', 'fan'),
  ('UC15M5L8SW2jhn-5wuCiaLUQ', '데일리센느', 'fan'),
  ('UCZJ-pp4DEcdTAj2VrsOooJw', '리센느어택', 'fan'),
  ('UCE5kCYky0ffJFMgWe2VnSOA', 'REO 리센느 팬애니', 'fan')
on conflict (channel_id) do nothing;
