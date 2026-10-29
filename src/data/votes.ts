import type { Vote } from "@/types";

/**
 * 투표 목록. 순서는 상관없습니다. 진행 중 → 예정 → 종료 순으로 자동 정렬되고,
 * endDate가 지나면 자동으로 "종료" 표시가 붙습니다.
 * 2026-10-26 기준 리센느 공식 X·MAMA 공식 X·언론 보도로 채웠습니다.
 */
export const votes: Vote[] = [
  {
    id: "mma2026-top10",
    i18n: { ja: {"awardName": "MMA 2026（メロンミュージックアワード）", "steps": ["Melonアプリをインストールしてログインします。（本人認証済みのアカウントのみ投票可能）", "画面下部または上部のMMAタブに入ります。", "「TOP10投票する」を押します。", "RESCENEを選んで投票します。"], "note": "1人1アカウント。TOP10は音源60%＋審査20%＋投票20%で決まります。"}, en: {"awardName": "MMA 2026 (Melon Music Awards)", "steps": ["Install the Melon app and log in. (Only identity-verified accounts can vote)", "Open the MMA tab at the bottom or top.", "Tap 'Vote TOP10'.", "Choose RESCENE and vote."], "note": "One account per person. TOP10 is decided by streaming 60% + judges 20% + votes 20%."} },
    awardName: "MMA 2026 (멜론뮤직어워드)",
    category: "TOP10",
    startDate: "2026-10-15T00:00:00+09:00",
    endDate: "2026-10-29T23:59:00+09:00",
    links: [{ label: "멜론", url: "https://www.melon.com/" }],
    steps: [
      "멜론 앱을 설치하고 로그인해요. (본인인증 완료 계정만 투표 가능)",
      "하단 또는 상단의 MMA 탭으로 들어가요.",
      "'TOP10 투표하기'를 눌러요.",
      "RESCENE(리센느)를 선택해 투표해요.",
    ],
    note: "1인 1계정. TOP10은 음원 60% + 심사 20% + 투표 20%로 결정돼요.",
  },
  {
    id: "mma2026-category",
    i18n: { ja: {"awardName": "MMA 2026（メロンミュージックアワード）", "category": "部門別投票", "steps": ["Melonアプリ → MMAタブに入ります。", "部門別投票で、RESCENEがノミネートされた部門を選びます。", "RESCENEを選んで投票します。"], "note": "報道に基づく日程です。RESCENEがノミネートされた部門は、投票開始後にMelonのお知らせで確認してください。"}, en: {"awardName": "MMA 2026 (Melon Music Awards)", "category": "Category votes", "steps": ["Melon app → open the MMA tab.", "In category voting, pick the categories RESCENE is nominated in.", "Choose RESCENE and vote."], "note": "Dates are based on press reports. Once voting opens, check Melon's notice for the categories RESCENE is nominated in."} },
    awardName: "MMA 2026 (멜론뮤직어워드)",
    category: "부문별 투표",
    startDate: "2026-10-30T00:00:00+09:00",
    endDate: "2026-11-13T23:59:00+09:00",
    links: [{ label: "멜론", url: "https://www.melon.com/" }],
    steps: [
      "멜론 앱 → MMA 탭으로 들어가요.",
      "부문별 투표에서 리센느가 후보로 오른 부문을 골라요.",
      "RESCENE(리센느)를 선택해 투표해요.",
    ],
    note: "보도 기준 일정이에요. 리센느가 오른 부문은 투표가 열리면 멜론 공지로 확인해 주세요.",
  },
  {
    id: "mama2026-fans-choice-2",
    i18n: { ja: {"category": "FANS' CHOICE 女性部門 2次", "steps": ["Mnet Plusアプリをインストールしてログインします。", "2026 MAMA AWARDS → FANS' CHOICE → 女性部門に入ります。", "RESCENEに投票します。", "Xで #2026MAMAVOTE と #RESCENE の両方のハッシュタグを入れて投稿すると追加投票になります。（公開アカウントにつき1日1回）"], "note": "Mnet Plus 90%＋X 10%の合算。RESCENEの2次進出は、1次の結果発表後にMnet Plusで確認してください。"}, en: {"category": "FANS' CHOICE Female, round 2", "steps": ["Install the Mnet Plus app and log in.", "Go to 2026 MAMA AWARDS → FANS' CHOICE → Female.", "Vote for RESCENE.", "On X, post with both #2026MAMAVOTE and #RESCENE for an extra vote. (Once a day per public account)"], "note": "Mnet Plus 90% + X 10%. Check Mnet Plus after the round 1 results to see whether RESCENE advanced to round 2."} },
    awardName: "2026 MAMA AWARDS",
    category: "FANS' CHOICE 여자 부문 2차",
    startDate: "2026-10-28T18:00:00+09:00",
    endDate: "2026-11-08T23:59:00+09:00",
    links: [
      { label: "Mnet Plus", url: "https://www.mnetplus.world/" },
      { label: "X 해시태그 투표", url: "https://x.com/" },
    ],
    steps: [
      "Mnet Plus 앱을 설치하고 로그인해요.",
      "2026 MAMA AWARDS → FANS' CHOICE → 여자 부문으로 들어가요.",
      "RESCENE(리센느)에 투표해요.",
      "X에서 #2026MAMAVOTE 와 #RESCENE 해시태그를 모두 넣어 글을 올리면 추가 투표가 돼요. (공개 계정당 하루 1회)",
    ],
    note: "Mnet Plus 90% + X 10% 합산. 리센느의 2차 진출 여부는 1차 결과 발표 후 Mnet Plus에서 확인해 주세요.",
  },
  {
    id: "mama2026-fans-choice-1",
    i18n: { ja: {"category": "FANS' CHOICE 女性部門 1次", "steps": ["Mnet Plusアプリ → 2026 MAMA AWARDS FANS' CHOICE 1次投票に入ります。", "ファンズチョイス女性部門 → RESCENEに投票します。"]}, en: {"category": "FANS' CHOICE Female, round 1", "steps": ["Mnet Plus app → open 2026 MAMA AWARDS FANS' CHOICE round 1.", "Fans' Choice Female → vote for RESCENE."]} },
    awardName: "2026 MAMA AWARDS",
    category: "FANS' CHOICE 여자 부문 1차",
    startDate: "2026-10-12T19:00:00+09:00",
    endDate: "2026-10-22T23:59:00+09:00",
    links: [{ label: "Mnet Plus", url: "https://www.mnetplus.world/" }],
    steps: [
      "Mnet Plus 앱 → 2026 MAMA AWARDS FANS' CHOICE 1차 투표로 들어가요.",
      "팬스 초이스 여자 → RESCENE(리센느)에 투표해요.",
    ],
  },
];
