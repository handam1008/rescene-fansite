/**
 * 사이트 전체에서 쓰는 데이터 타입.
 *
 * 나중에 Supabase로 옮길 때 각 타입이 그대로 테이블 1개가 되도록 설계했습니다.
 *   Comeback → comebacks 테이블 (teasers는 comeback_teasers 테이블 또는 jsonb 컬럼)
 *   Song     → songs 테이블 (streamingLinks는 jsonb 컬럼)
 *   Vote     → votes 테이블 (links, steps는 jsonb 컬럼)
 * 날짜는 모두 ISO 8601 문자열(예: "2026-12-01T18:00:00+09:00")로 저장합니다.
 * Supabase의 timestamptz 컬럼도 이 형식으로 주고받습니다.
 */

/** 샘플 데이터 여부. true면 화면에 "예시" 뱃지가 붙습니다. */
type SampleFlag = {
  isSample?: boolean;
};

export type TeaserEvent = {
  /** 공개 일시 (ISO 8601) */
  date: string;
  /** 예: "콘셉트 포토 1", "MV 티저" */
  title: string;
};

export type Comeback = SampleFlag & {
  id: string;
  albumTitle: string;
  /** 예: "미니 3집" */
  albumType: string;
  titleTrack: string;
  /** 발매 일시 (ISO 8601). D-day 카운트다운 기준 */
  releaseDate: string;
  description?: string;
  /** 수록곡 순서대로 (선택) */
  tracklist?: string[];
  /** 출처 기사·공지 링크 (선택) */
  sourceUrl?: string;
  teasers: TeaserEvent[];
};

export type StreamingPlatform =
  | "melon"
  | "genie"
  | "bugs"
  | "flo"
  | "vibe"
  | "spotify"
  | "apple_music"
  | "youtube_music";

export type StreamingLink = {
  platform: StreamingPlatform;
  url: string;
};

export type Song = SampleFlag & {
  id: string;
  title: string;
  album: string;
  /** 발매일 (ISO 8601). 가장 최근 날짜가 "최신곡"으로 표시됩니다 */
  releaseDate: string;
  /**
   * 유튜브 영상 ID. 주소가 https://www.youtube.com/watch?v=ABCDEFG 라면 "ABCDEFG".
   * 비워두면 영상 자리에 안내 문구가 나옵니다.
   */
  youtubeId?: string;
  streamingLinks: StreamingLink[];
};

export type VoteLink = {
  /** 버튼에 표시될 이름. 예: "OO 앱" */
  label: string;
  url: string;
};

export type Vote = SampleFlag & {
  id: string;
  /** 시상식·프로그램 이름 */
  awardName: string;
  /** 부문. 예: "신인상" */
  category?: string;
  /** 투표 시작/마감 일시 (ISO 8601) */
  startDate: string;
  endDate: string;
  links: VoteLink[];
  /** 투표 방법을 순서대로 */
  steps: string[];
  note?: string;
};

export type VoteStatus = "upcoming" | "ongoing" | "ended";

/* ───────── 2단계: Supabase 테이블 (supabase/migrations/0001_init.sql) ───────── */

export type Author = {
  nickname: string;
  /** supabase/migrations/0003 실행 전에는 없을 수 있음 */
  collected_count?: number;
  is_admin?: boolean;
} | null;

export type PostSummary = {
  id: number;
  title: string;
  created_at: string;
  /** supabase/migrations/0002 실행 전에는 없을 수 있음 */
  view_count?: number;
  image_paths?: string[];
  /** 멤버 게시판 글이면 멤버 slug (0003) */
  member?: string | null;
  profiles: Author;
  comments: { count: number }[];
};

export type Post = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  view_count?: number;
  image_paths?: string[];
  member?: string | null;
  profiles: Author;
};

export type PostComment = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Author;
};

/** 포카 도감 카드 (photocard_catalog) */
export type CatalogCard = {
  id: number;
  /** 출처 탭: "앨범", "CU 리센느빵", "할리스" … (0004 SQL 전에는 없음) */
  source?: string;
  /** 세트 이름: 앨범명 또는 "CU 리센느빵 1탄" 같은 이벤트명 */
  album: string;
  member: string;
  label: string;
  /** 비어 있으면 아직 도감 이미지가 없는 카드 */
  image_path: string | null;
  sort: number;
};

export type CollectionStatus = "pending" | "approved" | "rejected";

/** 회원의 실물 카드 인증 (photocard_collections) */
export type CollectionEntry = {
  id: number;
  user_id: string;
  card_id: number;
  photo_path: string;
  status: CollectionStatus;
  reject_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};
