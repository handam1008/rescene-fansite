import type { MemberSlug } from "./members";

/**
 * 리센느 일정. 순서는 상관없고 날짜순으로 자동 정렬됩니다.
 * 멤버 생일은 src/data/members.ts 의 birthday로 자동 추가되니 여기 적지 않아도 돼요.
 *
 * members: 비워두면 "단체" 일정, ["woni"] 처럼 적으면 해당 멤버 개인 일정
 * date / endDate: 한국 시간(+09:00)으로. 하루 일정이면 endDate는 빼도 돼요.
 * allDay: 시간이 정해지지 않은 일정이면 true (날짜만 표시)
 * important: 컴백처럼 중요한 일정이면 true (달력·목록에 ★). 곡 발매일은 자동으로 ★
 * tentative: 공식 확정이 아닌 예상 일정이면 true (점선·"미확정" 표시)
 * i18n: 일본어·영어 제목 { ja, en } (장소는 아래 placeI18n 에 한국어 장소 이름으로 추가)
 * live: 실시간으로 볼 수 있는 주소(유튜브 라이브 등). 적으면 그 시간(date ~ endDate, 없으면 2시간) 동안
 *       사이트 위쪽에 빨간 LIVE 줄이 뜸. 갑자기 하는 라이브는 /admin "라이브" 탭에서 넣는 게 편해요.
 *
 * 2026-10-27 기준. 공식 SNS·유튜브 업로드 기록과 출연 확정 보도로 확인한 일정만 넣었습니다(link 가 출처).
 * 음악방송·쇼케이스·팬사인회·연말 가요제는 공식 발표가 나오면 추가해 주세요.
 * 곡 발매일은 src/data/songs.ts 에서 자동으로 달력에 들어갑니다.
 */
export type ScheduleType = "release" | "broadcast" | "event" | "content" | "birthday" | "etc";

export type ScheduleEvent = {
  id: string;
  date: string;
  endDate?: string;
  allDay?: boolean;
  title: string;
  type: ScheduleType;
  members?: MemberSlug[];
  place?: string;
  link?: string;
  important?: boolean;
  tentative?: boolean;
  live?: string;
  /** 일본어·영어 제목 (없으면 한국어 제목 그대로) */
  i18n?: { ja: string; en: string };
};

/** 장소 번역 (한국어 장소 이름 그대로를 열쇠로) */
export const placeI18n: Record<string, { ja: string; en: string }> = {
  "유튜브 KBS Kpop": { ja: "YouTube KBS Kpop", en: "YouTube: KBS Kpop" },
  "각종 음원 사이트": { ja: "各音楽配信サイト", en: "Major streaming platforms" },
  "서울 고척스카이돔": { ja: "ソウル 高尺スカイドーム", en: "Gocheok Sky Dome, Seoul" },
  "일본 오사카 교세라 돔": { ja: "大阪 京セラドーム", en: "Kyocera Dome Osaka, Japan" },
  "대만 가오슝 내셔널 스타디움": { ja: "台湾 高雄国家体育場", en: "Kaohsiung National Stadium, Taiwan" },
  "프랑스 파리 라데팡스 아레나": { ja: "フランス パリ ラ・デファンス・アリーナ", en: "Paris La Défense Arena, France" },
  "안원잘부 몰 (helloiamwoni.com)": { ja: "안원잘부 モール（helloiamwoni.com）", en: "안원잘부 Mall (helloiamwoni.com)" },
  "유튜브 안녕하세요원이입니다잘부탁드립니다 · 이후 약 3주 휴재(컴백 활동·연말 무대 준비)": {
    ja: "YouTube「안녕하세요원이입니다잘부탁드립니다」・その後約3週間お休み（カムバック活動・年末ステージ準備）",
    en: "YouTube: 안녕하세요원이입니다잘부탁드립니다 · then a ~3-week break (comeback promotions, year-end stages)",
  },
  "유튜브 안녕하세요원이입니다잘부탁드립니다": {
    ja: "YouTube「안녕하세요원이입니다잘부탁드립니다」",
    en: "YouTube: 안녕하세요원이입니다잘부탁드립니다 (Woni's channel)",
  },
  "유튜브 안녕하세요원이입니다잘부탁드립니다 · 매주 금요일 목표(요일·주기 바뀔 수 있음)": {
    ja: "YouTube「안녕하세요원이입니다잘부탁드립니다」・毎週金曜目標（曜日・周期は変わる場合あり）",
    en: "YouTube: 안녕하세요원이입니다잘부탁드립니다 · aiming for Fridays (day and frequency may change)",
  },
};

export const schedule: ScheduleEvent[] = [
  // ── 미니 4집 'PULSE' 프로모션 (10월 12일 공식 SNS 스케줄러, MK스포츠·톱스타뉴스 보도) ──
  {
    id: "2026-10-13-preorder",
    date: "2026-10-13T00:00:00+09:00",
    allDay: true,
    title: "미니 4집 'PULSE' 예약 판매 시작",
    i18n: { ja: "4thミニアルバム『PULSE』予約販売開始", en: "4th Mini Album 'PULSE' pre-orders open" },
    type: "release",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-19-concept-a",
    date: "2026-10-19T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 포토 A 공개",
    i18n: { ja: "『PULSE』コンセプトフォトA公開", en: "'PULSE' concept photo A" },
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-20-concept-b",
    date: "2026-10-20T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 포토 B 공개",
    i18n: { ja: "『PULSE』コンセプトフォトB公開", en: "'PULSE' concept photo B" },
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-22-trailer",
    date: "2026-10-22T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 콘셉트 트레일러 공개",
    i18n: { ja: "『PULSE』コンセプトトレーラー公開", en: "'PULSE' concept trailer" },
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-23-tracklist",
    date: "2026-10-23T00:00:00+09:00",
    allDay: true,
    title: "'PULSE' 앨범 디테일 · 트랙리스트 공개",
    i18n: { ja: "『PULSE』アルバムディテール・トラックリスト公開", en: "'PULSE' album details · tracklist" },
    type: "content",
    link: "https://www.mksports.co.kr/news/entertain/12174129",
  },
  {
    id: "2026-10-26-highlight",
    date: "2026-10-26T18:00:00+09:00",
    title: "'PULSE' 하이라이트 메들리 공개",
    i18n: { ja: "『PULSE』ハイライトメドレー公開", en: "'PULSE' highlight medley" },
    type: "content",
    link: "https://www.youtube.com/watch?v=kmDGZd1mv7I",
  },
  {
    id: "2026-10-27-title-preview",
    date: "2026-10-27T00:00:00+09:00",
    allDay: true,
    title: "미니 4집 'PULSE' 타이틀 프리뷰 · 스페셜 콘텐츠",
    i18n: { ja: "4thミニアルバム『PULSE』タイトル曲プレビュー・スペシャルコンテンツ", en: "4th Mini Album 'PULSE' title track preview · special content" },
    type: "content",
    link: "https://www.topstarnews.net/news/articleView.html?idxno=16245163",
  },
  {
    id: "2026-10-30-mv-teaser",
    date: "2026-10-30T00:00:00+09:00",
    allDay: true,
    title: "'With' 뮤직비디오 티저 공개",
    i18n: { ja: "『With』MVティーザー公開", en: "'With' music video teaser" },
    type: "content",
    link: "https://www.topstarnews.net/news/articleView.html?idxno=16245163",
  },
  {
    id: "2026-11-03-pulse",
    date: "2026-11-03T18:00:00+09:00",
    title: "미니 4집 'PULSE' 발매",
    i18n: { ja: "4thミニアルバム『PULSE』リリース", en: "4th Mini Album 'PULSE' release" },
    type: "release",
    important: true,
    place: "각종 음원 사이트",
    link: "https://www.mediapen.com/news/view/1132218",
  },

  // ── 방송 출연 ──
  // 리센느 유튜브 커뮤니티 공지(2026-10-30): 리무진서비스 240회 리브 출연, 맛보기 쇼츠 2개
  {
    id: "2026-11-04-limousine-liv",
    date: "2026-11-04T18:00:00+09:00",
    title: "리무진서비스 240회 리브 출연",
    i18n: { ja: "「イ・ムジンサービス」第240回 リブ出演", en: "LeeMujin Service Ep. 240 · Liv" },
    type: "broadcast",
    members: ["liv"],
    place: "유튜브 KBS Kpop",
    link: "https://www.youtube.com/shorts/yQWGzkM_bhA",
  },

  // ── 시상식 · 행사 (출연 확정 보도 기준) ──
  {
    id: "2026-11-07-kgma",
    date: "2026-11-07T00:00:00+09:00",
    allDay: true,
    title: "2026 KGMA 아티스트 데이 출연 · 원이 MC",
    i18n: { ja: "2026 KGMA アーティストデイ出演・ウォニがMC", en: "2026 KGMA Artist Day · Woni as MC" },
    type: "event",
    place: "서울 고척스카이돔",
    link: "https://isplus.com/article/view/isp202609090130",
  },
  {
    id: "2026-11-14-mma",
    date: "2026-11-14T00:00:00+09:00",
    endDate: "2026-11-15T23:59:00+09:00",
    allDay: true,
    title: "멜론뮤직어워드 MMA 2026 출연 (출연일 미정)",
    i18n: { ja: "Melon Music Awards MMA 2026 出演（出演日未定）", en: "Melon Music Awards (MMA) 2026 (date TBA)" },
    type: "event",
    place: "서울 고척스카이돔",
    link: "https://www.dailian.co.kr/news/view/1698649",
  },
  {
    id: "2026-11-20-mama",
    date: "2026-11-20T00:00:00+09:00",
    endDate: "2026-11-21T23:59:00+09:00",
    allDay: true,
    title: "2026 MAMA AWARDS 출연",
    i18n: { ja: "2026 MAMA AWARDS 出演", en: "2026 MAMA AWARDS" },
    type: "event",
    place: "일본 오사카 교세라 돔",
    link: "https://www.sportsseoul.com/news/read/1641156",
  },
  {
    id: "2026-12-05-aaa",
    date: "2026-12-05T00:00:00+09:00",
    endDate: "2026-12-06T23:59:00+09:00",
    allDay: true,
    title: "AAA 2026 출연 (양일)",
    i18n: { ja: "AAA 2026 出演（両日）", en: "AAA 2026 (both days)" },
    type: "event",
    place: "대만 가오슝 내셔널 스타디움",
    link: "https://www.koreadaily.com/article/20260914152857308",
  },
  {
    id: "2027-01-15-dawards",
    date: "2027-01-15T00:00:00+09:00",
    endDate: "2027-01-16T23:59:00+09:00",
    allDay: true,
    title: "D AWARDS 2027 출연",
    i18n: { ja: "D AWARDS 2027 出演", en: "D AWARDS 2027" },
    type: "event",
    place: "프랑스 파리 라데팡스 아레나",
    link: "https://www.koreadaily.com/article/20261012172027290",
  },

  // ── 안원잘부 (원이 유튜브 '안녕하세요원이입니다잘부탁드립니다') 시즌2 업로드. 시각은 유튜브 공식 업로드 기록 ──
  {
    id: "2026-08-07-anwonjalbu",
    date: "2026-08-07T00:00:00+09:00",
    allDay: true,
    title: "[안원잘부] 시즌2 첫 공개",
    i18n: { ja: "[안원잘부] シーズン2 初公開", en: "[안원잘부] Season 2 premiere" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://m.news.nate.com/view/20260807n26483",
  },
  {
    id: "2026-08-21-anwonjalbu",
    date: "2026-08-21T19:00:00+09:00",
    title: "[안원잘부] 고윤정을 좋아하세요?",
    i18n: { ja: "[안원잘부] コ・ユンジョンは好きですか？", en: "[안원잘부] Do you like Go Youn-jung?" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=6y_g78FQ3io",
  },
  {
    id: "2026-08-28-anwonjalbu",
    date: "2026-08-28T19:00:00+09:00",
    title: "[안원잘부] 원이 근황",
    i18n: { ja: "[안원잘부] ウォニの近況", en: "[안원잘부] What Woni's been up to" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=EsKmhBMmqIM",
  },
  {
    id: "2026-09-04-anwonjalbu",
    date: "2026-09-04T19:00:00+09:00",
    title: "[안원잘부] 지금 기분이 어때요?",
    i18n: { ja: "[안원잘부] 今の気分はどうですか？", en: "[안원잘부] How are you feeling right now?" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=WQIerKK8zUQ",
  },
  {
    id: "2026-09-08-anwonjalbu",
    date: "2026-09-08T17:00:00+09:00",
    title: "[안원잘부] 두 번째 급습",
    i18n: { ja: "[안원잘부] 2度目の急襲", en: "[안원잘부] The second surprise visit" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=xCvbDeMKm3E",
  },
  {
    id: "2026-09-11-anwonjalbu",
    date: "2026-09-11T19:00:00+09:00",
    title: "[안원잘부] 살과의 전쟁: 20kg의 진실",
    i18n: { ja: "[안원잘부] 体重との戦い：20kgの真実", en: "[안원잘부] War on weight: the truth about 20kg" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=GJuMbGXXedY",
  },
  {
    id: "2026-09-15-anwonjalbu",
    date: "2026-09-15T18:00:00+09:00",
    title: "[안원잘부] 스팸 원이 에디션(?)",
    i18n: { ja: "[안원잘부] スパム ウォニ エディション(?)", en: "[안원잘부] Spam: Woni Edition(?)" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=mFM2hP5LEhM",
  },
  {
    id: "2026-09-18-anwonjalbu",
    date: "2026-09-18T19:00:00+09:00",
    title: "[안원잘부] [추석 특집] 제나의 트로트 메들리",
    i18n: { ja: "[안원잘부] [秋夕特集] ジェナのトロットメドレー", en: "[안원잘부] [Chuseok special] Zena's trot medley" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=JYUilbw34Z0",
  },
  {
    id: "2026-10-01-anwonjalbu",
    date: "2026-10-01T17:00:00+09:00",
    title: "[안원잘부] 치명적인 실수",
    i18n: { ja: "[안원잘부] 致命的なミス", en: "[안원잘부] A fatal mistake" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=zxNoW_LtVLE",
  },
  {
    id: "2026-10-04-anwonjalbu",
    date: "2026-10-04T19:00:00+09:00",
    title: "[안원잘부] 오사카에서 생긴 일",
    i18n: { ja: "[안원잘부] 大阪で起きたこと", en: "[안원잘부] What happened in Osaka" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=8tmaJYDMp5w",
  },
  {
    id: "2026-10-09-anwonjalbu",
    date: "2026-10-09T11:00:00+09:00",
    title: "[안원잘부] 명장면 이모티콘2 출시",
    i18n: { ja: "[안원잘부] 名場面スタンプ2 発売", en: "[안원잘부] Best-scene emoticons 2 released" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=DKDmFgXzxs8",
  },
  {
    id: "2026-10-12-anwonjalbu",
    date: "2026-10-12T19:30:00+09:00",
    title: "[안원잘부] ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ",
    i18n: { ja: "[안원잘부] ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ", en: "[안원잘부] ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=8e0FfuwOI9M",
  },
  {
    id: "2026-10-17-anwonjalbu",
    date: "2026-10-17T17:00:00+09:00",
    title: "[안원잘부] 언니 나 빼고 촬영 갔어?",
    i18n: { ja: "[안원잘부] オンニ、私抜きで撮影に行ったの？", en: "[안원잘부] Unnie, you went filming without me?" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=3Vb2TGjxDes",
  },
  {
    id: "2026-10-25-anwonjalbu",
    date: "2026-10-25T19:00:00+09:00",
    title: "[안원잘부] 4인조 걸그룹 리센느",
    i18n: { ja: "[안원잘부] 4人組ガールズグループ RESCENE", en: "[안원잘부] RESCENE, the four-member girl group" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다",
    link: "https://www.youtube.com/watch?v=1kHqK1oqHzc",
  },
  // ── 안원잘부 11월 일정: 원이 유튜브 채널 고정 댓글 공지(2026-10-26) ──
  {
    id: "2026-11-01-anwonjalbu-mall",
    date: "2026-11-01T00:00:00+09:00",
    endDate: "2026-11-05T23:59:00+09:00",
    allDay: true,
    title: "[안원잘부] 굿즈 몰 2차 예약 판매",
    i18n: { ja: "[안원잘부] グッズモール 第2次予約販売", en: "[안원잘부] Merch mall: 2nd pre-order" },
    type: "etc",
    place: "안원잘부 몰 (helloiamwoni.com)",
    link: "https://helloiamwoni.com/",
  },
  // 화요일(11/3) 또는 금요일(11/6) 중 하루에 업로드 → 두 날 모두 미확정으로 표시. 올라오면 실제 날짜 하나만 남기기
  {
    id: "2026-11-03-anwonjalbu",
    date: "2026-11-03T00:00:00+09:00",
    allDay: true,
    tentative: true,
    title: "[안원잘부] 새 영상 업로드 (11/3 또는 11/6)",
    i18n: { ja: "[안원잘부] 新しい動画公開（11/3または11/6）", en: "[안원잘부] New video (Nov 3 or Nov 6)" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다 · 이후 약 3주 휴재(컴백 활동·연말 무대 준비)",
    link: "https://www.youtube.com/@helloiamwoninicetomeetyou",
  },
  {
    id: "2026-11-06-anwonjalbu",
    date: "2026-11-06T00:00:00+09:00",
    allDay: true,
    tentative: true,
    title: "[안원잘부] 새 영상 업로드 (11/3 또는 11/6)",
    i18n: { ja: "[안원잘부] 新しい動画公開（11/3または11/6）", en: "[안원잘부] New video (Nov 3 or Nov 6)" },
    type: "content",
    place: "유튜브 안녕하세요원이입니다잘부탁드립니다 · 이후 약 3주 휴재(컴백 활동·연말 무대 준비)",
    link: "https://www.youtube.com/@helloiamwoninicetomeetyou",
  },
];

/**
 * 안원잘부 예상 업로드: 솔파스튜디오 공지(2026-10 초) "연말까지 매주 금요일을 목표로 하되, 상황에 따라 주기와 요일이 바뀔 수 있음".
 * 11월 공지(2026-10-26 채널 고정 댓글): 다음 영상은 11/3 또는 11/6, 그 뒤 약 3주 휴재 → 예상은 12월 첫 금요일부터.
 * 이 기간의 금요일마다 "미확정" 일정으로 달력에 자동 표시됩니다(lib/schedule.ts).
 * 지난 날짜와, 그 주에 실제 업로드([안원잘부] 일정)가 이미 적혀 있는 주는 자동으로 빠집니다.
 */
export const anwonjalbuPlan = {
  from: "2026-11-28",
  until: "2026-12-31",
  link: "https://www.youtube.com/post/UgkxYZhaOWAFY3P8Zb6YbEYPXX7_lEb6kR61",
};
