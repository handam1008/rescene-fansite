/** 오늘의 리센느 카드·공유 버튼 */

const ko = {
  today: {
    title: "오늘의 리센느",
    desc: "오늘 일정과 컴백 D-day를 카드 한 장으로. 저장해서 X·인스타·카톡에 올려주세요!",
    cardAlt: "오늘의 리센느 카드: 날짜, 컴백 D-day, 일정, 투표 마감",
    save: "이미지 저장",
    shareImage: "이미지 공유",
    postX: "X에 글쓰기",
    copyText: "글 복사",
    copied: "복사했어요!",
    xHint: "X는 글쓰기 창에 이미지를 붙일 수 없어서, 이미지를 먼저 저장한 다음 글쓰기 창에서 사진을 추가해 주세요.",
    postText: "📅 오늘의 리센느 ({date})",
    postDday: "{album} 컴백 {dday} 💜",
    postMore: "오늘 일정·투표는 여기서 👉",
    homeLink: "📸 오늘의 리센느 카드",
    // 카드 안 글자
    cardToday: "오늘 일정",
    cardUpcoming: "다가오는 일정",
    cardNoToday: "오늘은 일정이 없어요",
    cardVotes: "투표 마감 임박",
    cardVoteEnds: "~{date} 마감",
    cardComeback: "COMEBACK",
    cardOut: "OUT NOW",
    cardSite: "비공식 팬사이트",
  },
  share: {
    label: "공유",
    x: "X에 공유",
    more: "공유하기",
    copy: "링크 복사",
    copied: "링크를 복사했어요!",
  },
};

export type TodayMessages = typeof ko;

const ja: TodayMessages = {
  today: {
    title: "今日のRESCENE",
    desc: "今日の予定とカムバックD-dayをカード1枚に。保存してX・インスタ・LINEでシェアしてください！",
    cardAlt: "今日のRESCENEカード：日付、カムバックD-day、予定、投票の締め切り",
    save: "画像を保存",
    shareImage: "画像をシェア",
    postX: "Xにポスト",
    copyText: "文章をコピー",
    copied: "コピーしました！",
    xHint: "Xの投稿画面には画像を自動で添付できないため、先に画像を保存してから投稿画面で写真を追加してください。",
    postText: "📅 今日のRESCENE（{date}）",
    postDday: "『{album}』カムバック {dday} 💜",
    postMore: "今日の予定・投票はこちら 👉",
    homeLink: "📸 今日のRESCENEカード",
    cardToday: "今日の予定",
    cardUpcoming: "今後の予定",
    cardNoToday: "今日の予定はありません",
    cardVotes: "締め切り間近の投票",
    cardVoteEnds: "〜{date} 締め切り",
    cardComeback: "COMEBACK",
    cardOut: "OUT NOW",
    cardSite: "非公式ファンサイト",
  },
  share: {
    label: "シェア",
    x: "Xでシェア",
    more: "シェア",
    copy: "リンクをコピー",
    copied: "リンクをコピーしました！",
  },
};

const en: TodayMessages = {
  today: {
    title: "RESCENE Today",
    desc: "Today's schedule and the comeback countdown on one card. Save it and share it on X, Instagram or anywhere!",
    cardAlt: "RESCENE Today card: date, comeback countdown, schedule and voting deadlines",
    save: "Save image",
    shareImage: "Share image",
    postX: "Post on X",
    copyText: "Copy text",
    copied: "Copied!",
    xHint: "X can't attach the image automatically, so save the image first and add it as a photo in the post window.",
    postText: "📅 RESCENE Today ({date})",
    postDday: "'{album}' comeback {dday} 💜",
    postMore: "Today's schedule & votes 👉",
    homeLink: "📸 RESCENE Today card",
    cardToday: "Today",
    cardUpcoming: "Coming up",
    cardNoToday: "No events today",
    cardVotes: "Votes closing soon",
    cardVoteEnds: "Ends {date}",
    cardComeback: "COMEBACK",
    cardOut: "OUT NOW",
    cardSite: "Unofficial fan site",
  },
  share: {
    label: "Share",
    x: "Share on X",
    more: "Share",
    copy: "Copy link",
    copied: "Link copied!",
  },
};

const today = { ko, ja, en };
export default today;
