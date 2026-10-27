# Supabase 도쿄 이전 메모

예전 프로젝트 `acrdlbsltnuyrtlwyycs`(시드니, ap-southeast-2)에서
새 프로젝트 `srpmyhrbimcysypfkoeh`(도쿄, ap-northeast-1)로 옮깁니다.
사이트 서버(Vercel)도 DB 옆인 도쿄 `hnd1`로 맞춥니다.

## 2026-10-27 기준 예전 DB에 있던 것

| 항목 | 개수 | 옮기는 방법 |
|---|---|---|
| 회원(auth.users) | 2 (류한담·임윤호) | 새로 가입 (비밀번호는 옮기기 어려움) |
| 글 | 2 (1번 류한담, 4번 임윤호 · 사진 1장) | 새로 시작하거나, 재가입 후 닉네임 기준으로 다시 넣기 |
| 댓글 | 0 | - |
| 추천 1 · 신고 1 | 2 | 글과 함께 버림 |
| 도감 카드 | 155 (이미지 0) | 마이그레이션 0004·0005가 자동으로 다시 넣음 |
| 포카 인증 | 0 | - |
| 저장소 파일 | post-images 1장 | 글을 옮길 때만 |

## 순서

1. 새 프로젝트에 `migrations/0001` ~ `0008`을 차례대로 실행
2. 새 프로젝트 Auth 설정: Site URL·Redirect URL을 사이트 주소(https://rescene-fansite.vercel.app)로
3. `src/lib/supabase/env.ts`의 기본 URL·publishable 키를 새 프로젝트 값으로 바꾸고,
   Vercel 환경 변수에 예전 값이 있으면 같이 바꾸기
4. `vercel.json`의 `regions`를 `["hnd1"]`로
5. 배포 후 류한담 재가입 → 운영자 지정:
   `update public.profiles set is_admin = true where nickname = '류한담';`
6. 잘 되는지 확인한 뒤 예전 프로젝트는 일시 중지(삭제는 나중에)

## 진행 상황 (2026-10-27)

- [x] 새 프로젝트에 0001~0008 실행 (테이블 7, 도감 155장·링크 155, 버킷 4, 정책 36)
- [x] Auth Site URL·Redirect URL 설정
- [x] env.ts 기본 URL·publishable 키 교체, vercel.json hnd1
- [x] 예전 글 2개·회원 2명은 옮기지 않고 새로 시작하기로 함
- [ ] 배포 후 류한담 재가입 → 운영자 지정
- [ ] 예전 프로젝트 일시 중지
