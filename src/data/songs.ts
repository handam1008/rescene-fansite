import type { Song, StreamingLink } from "@/types";

/**
 * 노래 목록. 순서는 상관없고, 발매일이 가장 최근인 곡이 "최신곡"으로 크게 표시됩니다.
 * 발매일이 아직 안 된 곡은 숨겨져 있다가 발매 시각이 지나면 자동으로 나타나요.
 *
 * youtubeId: 리센느 공식 채널의 뮤직비디오 ID (youtube.com/watch?v=여기)
 * 음원 링크: 곡별 고유 주소 대신 각 사이트의 "리센느 + 곡명" 검색 결과로 연결합니다.
 *            곡 페이지 주소로 바꾸고 싶으면 streamingLinks에 직접 넣으면 돼요.
 */
function searchLinks(title: string): StreamingLink[] {
  const q = encodeURIComponent(`리센느 ${title}`);
  return [
    { platform: "melon", url: `https://www.melon.com/search/total/index.htm?q=${q}` },
    { platform: "genie", url: `https://www.genie.co.kr/search/searchMain?query=${q}` },
    { platform: "bugs", url: `https://music.bugs.co.kr/search/integrated?q=${q}` },
    { platform: "flo", url: `https://www.music-flo.com/search/all?keyword=${q}` },
    { platform: "spotify", url: `https://open.spotify.com/search/${encodeURIComponent(`RESCENE ${title}`)}` },
    { platform: "youtube_music", url: `https://music.youtube.com/search?q=${encodeURIComponent(`RESCENE ${title}`)}` },
  ];
}

export const songs: Song[] = [
  {
    id: "with",
    title: "With",
    album: "미니 4집 PULSE",
    releaseDate: "2026-11-03T18:00:00+09:00",
    youtubeId: "", // 발매 후 공식 MV ID를 넣어주세요
    streamingLinks: searchLinks("With"),
  },
  {
    id: "pretty-girl",
    title: "Pretty Girl",
    album: "스페셜 싱글 Pretty Girl (리메이크)",
    releaseDate: "2026-07-08T18:00:00+09:00",
    youtubeId: "qZlu2j2SiBA", // Special Video
    streamingLinks: searchLinks("Pretty Girl"),
  },
  {
    id: "runaway",
    title: "Runaway",
    album: "디지털 싱글 Runaway",
    releaseDate: "2026-04-08T18:00:00+09:00",
    youtubeId: "rsZwrTNklos",
    streamingLinks: searchLinks("Runaway"),
  },
  {
    id: "bloom",
    title: "Bloom",
    album: "미니 3집 lip bomb",
    releaseDate: "2025-11-25T18:00:00+09:00",
    youtubeId: "MC6-82GRK5I",
    streamingLinks: searchLinks("Bloom"),
  },
  {
    id: "heart-drop",
    title: "Heart Drop",
    album: "미니 3집 lip bomb (선공개)",
    releaseDate: "2025-11-06T18:00:00+09:00",
    youtubeId: "ByX8EZq8500",
    streamingLinks: searchLinks("Heart Drop"),
  },
  {
    id: "deja-vu",
    title: "Deja Vu",
    album: "싱글 2집 Dearest",
    releaseDate: "2025-07-02T18:00:00+09:00",
    youtubeId: "ZbO9PBdFRdc",
    streamingLinks: searchLinks("Deja Vu"),
  },
  {
    id: "glow-up",
    title: "Glow Up",
    album: "미니 2집 Glow Up",
    releaseDate: "2025-02-05T18:00:00+09:00",
    youtubeId: "h0xUtrb_JBc",
    streamingLinks: searchLinks("Glow Up"),
  },
  {
    id: "love-attack",
    title: "LOVE ATTACK",
    album: "미니 1집 SCENEDROME",
    releaseDate: "2024-08-27T18:00:00+09:00",
    youtubeId: "9XttLI0oH0I",
    streamingLinks: searchLinks("LOVE ATTACK"),
  },
  {
    id: "pinball",
    title: "Pinball",
    album: "미니 1집 SCENEDROME",
    releaseDate: "2024-08-27T18:00:00+09:00",
    youtubeId: "B8JJ8RNM-60",
    streamingLinks: searchLinks("Pinball"),
  },
  {
    id: "uhuh",
    title: "UhUh",
    album: "싱글 1집 Re:Scene (데뷔)",
    releaseDate: "2024-03-26T18:00:00+09:00",
    youtubeId: "",
    streamingLinks: searchLinks("UhUh"),
  },
];
