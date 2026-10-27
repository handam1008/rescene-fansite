-- 게시판 신고 사유 추가: 다른 아이돌 언급·비교, 루머·사생활 침해 (게시판 규칙 /board/rules 와 맞춤)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여넣고 Run 하면 됩니다.
-- 0007 을 먼저 실행한 상태여야 하고, 여러 번 실행해도 안전합니다.

alter table public.post_reports drop constraint if exists post_reports_reason_check;
alter table public.post_reports add constraint post_reports_reason_check
  check (reason in ('idol', 'abuse', 'rumor', 'spam', 'adult', 'privacy', 'copyright', 'other'));
