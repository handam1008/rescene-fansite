import type { Song } from "@/types";

/**
 * 노래 목록.
 * ⚠️ 아래는 모두 "예시" 데이터입니다. 실제 정보로 바꾼 뒤 isSample을 false로 바꾸거나 지워주세요.
 * 순서는 상관없습니다. releaseDate가 가장 최근인 곡이 "최신곡"으로 크게 표시됩니다.
 * 음원 링크는 각 사이트에서 곡 페이지 주소를 복사해 넣어주세요.
 */
export const songs: Song[] = [
  {
    id: "sample-song-3",
    isSample: true,
    title: "예시 신곡",
    album: "예시 앨범 3",
    releaseDate: "2026-10-01T18:00:00+09:00",
    youtubeId: "",
    streamingLinks: [
      { platform: "melon", url: "https://www.melon.com/" },
      { platform: "genie", url: "https://www.genie.co.kr/" },
      { platform: "bugs", url: "https://music.bugs.co.kr/" },
      { platform: "flo", url: "https://www.music-flo.com/" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "sample-song-2",
    isSample: true,
    title: "예시 이전곡 2",
    album: "예시 앨범 2",
    releaseDate: "2026-05-01T18:00:00+09:00",
    youtubeId: "",
    streamingLinks: [{ platform: "melon", url: "https://www.melon.com/" }],
  },
  {
    id: "sample-song-1",
    isSample: true,
    title: "예시 이전곡 1",
    album: "예시 앨범 1",
    releaseDate: "2025-11-01T18:00:00+09:00",
    youtubeId: "",
    streamingLinks: [{ platform: "melon", url: "https://www.melon.com/" }],
  },
];
