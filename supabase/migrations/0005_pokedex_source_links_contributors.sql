-- 포카 도감: 카드별 출처 링크 + 도감 이미지 제공자
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0001 ~ 0004 를 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.
--
-- 공식 이미지를 복제해 올리는 대신, 카드마다 공식 공지·기사 링크를 달고
-- 도감 이미지는 회원 실물 인증 사진으로 채웁니다(누가 제공했는지 도감에 표시).

-- ───────────────────────── 출처 링크 ─────────────────────────
alter table public.photocard_catalog add column if not exists source_url text;
alter table public.photocard_catalog drop constraint if exists photocard_catalog_source_url_valid;
alter table public.photocard_catalog add constraint photocard_catalog_source_url_valid
  check (source_url is null or (source_url ~ '^https?://' and char_length(source_url) <= 500));

-- 0004 로 넣은 카드에 세트별 출처 링크 채우기 (src/data/pokedex-sets.ts 와 같은 주소, 이미 적힌 건 그대로)
update public.photocard_catalog c
set source_url = v.url
from (values
  ('Re:Scene', 'https://rescene.fandom.com/wiki/Re:Scene'),
  ('Dearest', 'https://rescene.fandom.com/wiki/Dearest'),
  ('PULSE', 'https://www.kpoptown.com/brand/147-rescene'),
  ('CU 리센느빵 1탄', 'https://zdnet.co.kr/view/?no=20260915091011'),
  ('할리스 리센느 세트 증정', 'https://m.hollys.co.kr/news/eventView.do?idx=555'),
  ('도미노피자 방문포장 증정', 'https://news.nate.com/view/20260803n08841'),
  ('MLB 미야옹비니 증정', 'https://www.wikitree.co.kr/articles/1165467')
) as v(album, url)
where c.album = v.album and c.source_url is null;

-- ───────────────────────── 도감 이미지 제공자 ─────────────────────────
-- 회원 인증 사진이 도감 이미지로 쓰이면 그 회원. 운영자가 직접 올린 이미지면 비어 있음
alter table public.photocard_catalog add column if not exists image_contributor uuid
  references public.profiles (id) on delete set null;
