/**
 * 포카 도감 세트(앨범·콜라보) 설명. 도감에서 세트 제목 아래에 보여줍니다.
 * 카드 목록 자체는 DB(photocard_catalog)에 있고, 처음 목록은 supabase/migrations/0004 로 넣었습니다.
 * key: 카드의 album 값과 똑같이 적어야 합니다.
 *
 * 2026-10-27 기준으로 조사했습니다. "추정"이라고 적힌 곳은 공식 발표에 멤버별 구성이 없어
 * 일반적인 구성(멤버별 같은 장수)으로 나눠둔 것이니, 실제와 다르면 /admin 에서 고쳐주세요.
 */
import type { CatalogCard } from "@/types";

export type PokedexSet = {
  /** 언제·어떻게 받는지 */
  how: string;
  note?: string;
  link?: string;
  /** 일본어·영어 설명 */
  i18n?: Record<"ja" | "en", { how: string; note?: string }>;
};

/** 도감 위쪽 출처 탭 순서 (여기 없는 출처는 맨 뒤에 붙음) */
export const pokedexSources = ["앨범", "CU 리센느빵", "할리스", "MLB", "도미노피자"];

export const pokedexSets: Record<string, PokedexSet> = {
  "Re:Scene": {
    i18n: { ja: {"how": "1stシングル・2024.03.26・フォトブック2種（トレカA・B各5種からランダム1枚）、PLVE 2種（セルカトレカ5種からランダム1枚）"}, en: {"how": "1st single · 2024.03.26 · 2 photobook versions (1 random of 5 photocards each for A and B), 2 PLVE versions (1 random of 5 selfie photocards)"} },
    how: "싱글 1집 · 2024.03.26 · 포토북 2종(포토카드 A·B 각 5종 중 랜덤 1장), PLVE 2종(셀카 포토카드 5종 중 랜덤 1장)",
    link: "https://rescene.fandom.com/wiki/Re:Scene",
  },
  Dearest: {
    i18n: { ja: {"how": "2ndシングル・2025.07.02・フォトブック（トレカ10種からランダム2枚）、QRバージョン（セルカ20種からランダム3枚＋コンセプト5種から1枚）", "note": "フォトブック10種・セルカ20種は、メンバーごとに同じ枚数で分けた推定構成です。"}, en: {"how": "2nd single · 2025.07.02 · Photobook (2 random of 10 photocards), QR version (3 random of 20 selfies + 1 of 5 concept cards)", "note": "The 10 photobook cards and 20 selfies are an estimated split with the same number per member."} },
    how: "싱글 2집 · 2025.07.02 · 포토북(포토카드 10종 중 랜덤 2장), QR 버전(셀카 20종 중 랜덤 3장 + 콘셉트 5종 중 1장)",
    note: "포토북 10종·셀카 20종은 멤버별 같은 장수로 나눈 추정 구성이에요.",
    link: "https://rescene.fandom.com/wiki/Dearest",
  },
  PULSE: {
    i18n: { ja: {"how": "4thミニアルバム・2026.11.03・Standard（トレカ10種から2枚＋ユニット5種から1枚）、Limited（10種から2枚）、Wappen（5種から1枚）、QR（セルカ15種から3枚）", "note": "発売前の販売店の構成表に基づいています。Guardianバージョンのトレカセット、QRランダムトレカは構成が公開され次第追加します。"}, en: {"how": "4th mini album · 2026.11.03 · Standard (2 of 10 photocards + 1 of 5 unit cards), Limited (2 of 10), Wappen (1 of 5), QR (3 of 15 selfies)", "note": "Based on retailers' pre-release lists. Guardian version photocard sets and QR random photocards will be added once announced."} },
    how: "미니 4집 · 2026.11.03 · Standard(포토카드 10종 중 2장 + 유닛 5종 중 1장), Limited(10종 중 2장), Wappen(5종 중 1장), QR(셀카 15종 중 3장)",
    note: "발매 전 판매처 구성표 기준이에요. Guardian 버전 포토카드 세트, QR 랜덤 포토카드는 구성이 공개되면 추가할게요.",
    link: "https://www.kpoptown.com/brand/147-rescene",
  },
  "CU 리센느빵 1탄": {
    i18n: { ja: {"how": "CU「BAKE405 RESCENEパン」5種に、クリアトレカ27種からランダム1枚・2026.09.17〜", "note": "メンバーごと4枚＋グループ・スペシャル7枚はファンのまとめに基づいています（公式未発表）。10月26日から第2弾（28種）に変わりました。"}, en: {"how": "Comes with CU 'BAKE405 RESCENE Bread' (5 kinds): 1 random of 27 clear photocards · from 2026.09.17", "note": "4 per member + 7 group/special cards is based on fan lists (not officially announced). It switched to vol.2 (28 cards) on Oct 26."} },
    how: "CU 'BAKE405 리센느빵' 5종에 투명 포토카드 27종 중 랜덤 1장 · 2026.09.17~",
    note: "멤버별 4장 + 단체·스페셜 7장은 팬 정리 기준이에요(공식 미공개). 10월 26일부터 2탄(28종)으로 바뀌었어요.",
    link: "https://zdnet.co.kr/view/?no=20260915091011",
  },
  "CU 리센느빵 2탄": {
    i18n: { ja: {"how": "CU「BAKE405 RESCENEパン」に、新しいクリアトレカ28種からランダム1枚・2026.10.26出荷分〜", "note": "全28種は報道で確認済みですが、メンバーごと4枚＋グループ8枚の内訳は仮のものです。実際の構成と違えば直します。"}, en: {"how": "Comes with CU 'BAKE405 RESCENE Bread': 1 random of 28 new clear photocards · from Oct 26, 2026 shipments", "note": "28 cards in total is confirmed by news reports, but the 4-per-member + 8 group split is provisional. It will be corrected if the actual lineup differs."} },
    how: "CU 'BAKE405 리센느빵'에 새 투명 포토카드 28종 중 랜덤 1장 · 2026.10.26 출고분~",
    note: "총 28종은 보도로 확인됐지만, 멤버별 4장 + 단체 8장 구성은 임시예요. 실제 구성과 다르면 고칠게요.",
    link: "https://www.fnnews.com/news/202610191619265229",
  },
  "할리스 리센느 세트 증정": {
    i18n: { ja: {"how": "HOLLYSの店舗でメンバー別RESCENEセット（13,500ウォン）を購入すると5種からランダム1枚・2026.08.26〜なくなり次第終了"}, en: {"how": "Buy a member RESCENE set (₩13,500) at HOLLYS to get 1 random of 5 · from 2026.08.26 while supplies last"} },
    how: "할리스 매장에서 멤버별 리센느 세트(13,500원) 구매 시 5종 중 랜덤 1장 · 2026.08.26~소진 시",
    link: "https://m.hollys.co.kr/news/eventView.do?idx=555",
  },
  "도미노피자 방문포장 증정": {
    i18n: { ja: {"how": "ドミノ・ピザのアプリでテイクアウトのプレミアムピザ（L）を注文すると、メンバー5種からランダム1枚・2026.08・先着順"}, en: {"how": "Order a premium pizza (L) for takeout in the Domino's app to get 1 random of 5 members · 2026.08 · first come, first served"} },
    how: "도미노피자 앱 방문포장으로 프리미엄 피자(L) 주문 시 멤버 5종 중 랜덤 1장 · 2026.08 · 선착순",
    link: "https://news.nate.com/view/20260803n08841",
  },
  "MLB 미야옹비니 증정": {
    i18n: { ja: {"how": "MLB 26FW ビーニーキャンペーン・2026.10.07〜・購入者にグラビアトレカをランダムでプレゼント、ホログラムスペシャルカードもランダム", "note": "報道に出たグラビアのメンバー4人（リブ・ミナミ・メイ・ジェナ）に基づく推定構成です。"}, en: {"how": "MLB 26FW beanie campaign · from 2026.10.07 · a random photoshoot photocard for buyers, plus random hologram special cards", "note": "Estimated lineup based on the 4 members in the reported photoshoot (Liv, Minami, May, Zena)."} },
    how: "MLB 26FW 비니 캠페인 · 2026.10.07~ · 구매 고객에게 화보 포토카드 랜덤 증정, 홀로그램 스페셜 카드 랜덤",
    note: "보도에 나온 화보 멤버 4명(리브·미나미·메이·제나) 기준 추정 구성이에요.",
    link: "https://www.wikitree.co.kr/articles/1165467",
  },
};

/** 카드의 출처 링크: 카드에 따로 적힌 링크가 먼저, 없으면 세트 링크 */
export function cardSourceUrl(card: Pick<CatalogCard, "album" | "source_url">) {
  return card.source_url || pokedexSets[card.album]?.link;
}

/* ───────── 번역 (도감 카드 이름은 DB 에 한국어로 있어서, 낱말을 바꿔 보여줌) ───────── */

const SOURCE_NAMES: Record<string, Record<"ja" | "en", string>> = {
  앨범: { ja: "アルバム", en: "Album" },
  "CU 리센느빵": { ja: "CU RESCENEパン", en: "CU RESCENE Bread" },
  할리스: { ja: "HOLLYS", en: "HOLLYS" },
  도미노피자: { ja: "ドミノ・ピザ", en: "Domino's Pizza" },
};

const SET_NAMES: Record<string, Record<"ja" | "en", string>> = {
  "CU 리센느빵 1탄": { ja: "CU RESCENEパン 第1弾", en: "CU RESCENE Bread vol.1" },
  "CU 리센느빵 2탄": { ja: "CU RESCENEパン 第2弾", en: "CU RESCENE Bread vol.2" },
  "할리스 리센느 세트 증정": { ja: "HOLLYS RESCENEセット特典", en: "HOLLYS RESCENE set gift" },
  "도미노피자 방문포장 증정": { ja: "ドミノ・ピザ テイクアウト特典", en: "Domino's Pizza takeout gift" },
  "MLB 미야옹비니 증정": { ja: "MLB ミヤオンビーニー特典", en: "MLB 'Miyaong' beanie gift" },
};

/** 긴 말부터 바꿈 ("단체 투명 포토카드" 가 "포토카드" 보다 먼저) */
const CARD_WORDS: [string, Record<"ja" | "en", string>][] = [
  ["단체 투명 포토카드", { ja: "グループ クリアトレカ", en: "Group clear photocard" }],
  ["스페셜 투명 포토카드", { ja: "スペシャル クリアトレカ", en: "Special clear photocard" }],
  ["방문포장 증정 포토카드", { ja: "テイクアウト特典トレカ", en: "Takeout gift photocard" }],
  ["세트 증정 포토카드", { ja: "セット特典トレカ", en: "Set gift photocard" }],
  ["홀로그램 스페셜 카드", { ja: "ホログラム スペシャルカード", en: "Hologram special card" }],
  ["투명 포토카드", { ja: "クリアトレカ", en: "Clear photocard" }],
  ["화보 포토카드", { ja: "グラビアトレカ", en: "Photoshoot photocard" }],
  ["셀카 포토카드", { ja: "セルカトレカ", en: "Selfie photocard" }],
  ["콘셉트 포토카드", { ja: "コンセプトトレカ", en: "Concept photocard" }],
  ["유닛 포토카드", { ja: "ユニットトレカ", en: "Unit photocard" }],
  ["포토북", { ja: "フォトブック", en: "Photobook" }],
  ["포토카드", { ja: "トレカ", en: "Photocard" }],
];

type L = "ko" | "ja" | "en";

export const sourceName = (source: string, locale: L) => (locale === "ko" ? source : (SOURCE_NAMES[source]?.[locale] ?? source));
export const setName = (album: string, locale: L) => (locale === "ko" ? album : (SET_NAMES[album]?.[locale] ?? album));

export function cardLabel(label: string, locale: L) {
  if (locale === "ko") return label;
  let s = label;
  for (const [ko, t] of CARD_WORDS) s = s.replaceAll(ko, t[locale]);
  return s;
}

/** 세트 설명 (언어별) */
export function setInfo(album: string, locale: L): { how: string; note?: string } | undefined {
  const set = pokedexSets[album];
  if (!set) return undefined;
  return locale === "ko" ? set : (set.i18n?.[locale] ?? set);
}

