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
    i18n: { ja: {"awardName": "MMA 2026（メロンミュージックアワード）", "category": "部門別投票", "steps": ["Melonアプリ → MMAタブ → 部門別投票に入ります。", "必須の3部門すべてに投票します：グローバルTOP10はRESCENE、残り2部門は下の連合チームへ。", "Melonの投票履歴をキャプチャして、連合認証ヘルパーで認証します。"], "note": "RESCENE音源総攻撃チーム（@ResceneStream）のお知らせに基づきます。連合は変わることがあるので、投票前にヘルパーサイトを確認してください。"}, en: {"awardName": "MMA 2026 (Melon Music Awards)", "category": "Category votes", "steps": ["Melon app → MMA tab → category voting.", "Vote in all 3 required categories: RESCENE for Global TOP10, and the ally teams below for the other two.", "Screenshot your Melon voting history and submit it on the ally verification helper."], "note": "Based on the RESCENE streaming team (@ResceneStream) notice. Allies can change, so check the helper site before voting."} },
    awardName: "MMA 2026 (멜론뮤직어워드)",
    category: "부문별 투표",
    startDate: "2026-10-30T00:00:00+09:00",
    endDate: "2026-11-13T23:59:00+09:00",
    links: [
      { label: "멜론", url: "https://www.melon.com/" },
      { label: "연합 인증 헬퍼 (음원총공팀)", url: "https://rescene-team.github.io/mama-vote/" },
    ],
    steps: [
      "멜론 앱 → MMA 탭 → 부문별 투표로 들어가요.",
      "필수 3개 부문을 모두 투표해요: 글로벌 TOP10은 RESCENE(리센느), 나머지 두 부문은 아래 연합 팀에게.",
      "멜론 투표 이력을 캡처해서 연합 인증 헬퍼에서 인증해요.",
    ],
    note: "리센느 음원총공팀(@ResceneStream) 공지 기준이에요. 연합은 바뀔 수 있으니 투표 전에 헬퍼 사이트를 확인해 주세요.",
    allies: [
      { category: "올해의 신인", team: "알파드라이브원", hashtag: "#리마인_앨리즈_함께달려", i18n: { ja: "今年の新人", en: "New Artist of the Year" } },
      { category: "올해의 베스트송", team: "코르티스 'RED RED'", i18n: { ja: "今年のベストソング", en: "Best Song of the Year" } },
    ],
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
      { label: "X 인증 헬퍼 (음원총공팀)", url: "https://rescene-team.github.io/mama-vote/" },
    ],
    allies: [{ category: "연합 팀 투표", team: "앤더블 (AND2BLE)", hashtag: "#리마인과_앤클로의_HappyBloom", i18n: { ja: "連合チームへの投票", en: "Ally team vote" } }],
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
