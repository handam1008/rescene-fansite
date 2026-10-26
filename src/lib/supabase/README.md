# Supabase 연결 자리 (2단계 예정)

지금은 비어 있습니다. Supabase를 붙일 때 이 폴더에 아래 파일을 만듭니다.

- `client.ts` — 브라우저용 클라이언트 (`@supabase/ssr`의 `createBrowserClient`)
- `server.ts` — 서버 컴포넌트용 클라이언트 (`createServerClient`)

그 다음 `src/lib/data.ts`의 함수 내부만 Supabase 조회로 바꾸면 됩니다.
테이블 구조는 `src/types/index.ts`의 타입을 그대로 따르면 됩니다.
환경 변수는 루트의 `.env.example`을 `.env.local`로 복사해서 채웁니다.
