# RESCENE 비공식 팬사이트

리센느(RESCENE)의 컴백·신곡·투표 소식을 모아보는 **비공식** 팬사이트입니다. 소속사와 관련이 없습니다.

Next.js (App Router) · TypeScript · Tailwind CSS v4

## 로컬에서 실행하기

Node.js 20 이상이 필요합니다.

```bash
npm install     # 처음 한 번만
npm run dev     # 개발 서버 → http://localhost:3000
```

배포 전 확인: `npm run build && npm start`

**Windows**: 폴더의 `start.bat`을 더블클릭하면 최신 코드 받기 → 패키지 확인 → 실행 → 브라우저 열기까지 한 번에 됩니다. 끌 때는 검은 창을 닫으면 됩니다.

## 내용 수정하기 (data 폴더)

| 파일 | 내용 |
| --- | --- |
| `src/data/comeback.ts` | 컴백 정보 (앨범명, 타이틀곡, 발매일, 티저 일정). 배열의 **첫 번째** 항목이 표시됨 |
| `src/data/songs.ts` | 노래 목록. `releaseDate`가 가장 최근인 곡이 "최신곡"으로 크게 표시됨 |
| `src/data/votes.ts` | 투표 목록. 진행 중 → 예정 → 종료 순으로 자동 정렬, 마감 지나면 자동 "종료" |

- 지금 들어 있는 내용은 모두 **예시**입니다. 실제 정보로 바꾼 뒤 `isSample: true` 줄을 지우면 "예시" 뱃지가 사라집니다.
- 날짜는 `"2026-12-01T18:00:00+09:00"` 형식(한국 시간 +09:00)으로 적어주세요.
- 유튜브: `https://www.youtube.com/watch?v=ABCDEFG` 의 `ABCDEFG` 부분만 `youtubeId`에 넣으세요.
- 음원 링크 `platform` 값: `melon`, `genie`, `bugs`, `flo`, `vibe`, `spotify`, `apple_music`, `youtube_music`
- 각 항목에 어떤 값이 들어가는지는 `src/types/index.ts`에 설명이 있습니다. 잘못 넣으면 에디터에 빨간 줄이 표시돼요.

## 폴더 구조

```
src/
├─ app/                 페이지 (홈, comeback, songs, votes)
├─ components/          헤더·푸터·카드·카운트다운·유튜브 임베드
├─ data/                ✏️ 직접 수정하는 데이터 파일
├─ lib/
│  ├─ data.ts           데이터 조회 함수 (Supabase로 바꿀 때 여기만 수정)
│  ├─ format.ts         날짜·음원 사이트 이름 표시
│  └─ supabase/         Supabase 연결 자리 (2단계)
└─ types/index.ts       데이터 타입 = 나중의 DB 테이블 구조
```

## 다음 단계 메모

- **Supabase**: `src/lib/supabase/README.md` 참고. `.env.example` → `.env.local` 복사 후 키 입력.
- **Vercel**: 저장소를 Vercel에 연결하면 별도 설정 없이 배포됩니다. 환경 변수는 Vercel 프로젝트 설정에 같은 이름으로 넣어주세요.
- **포카·게시판 메뉴**: `src/components/Header.tsx`의 `navItems`에 `href`를 추가하면 "준비 중"이 풀립니다.
