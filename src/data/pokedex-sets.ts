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
};

/** 도감 위쪽 출처 탭 순서 (여기 없는 출처는 맨 뒤에 붙음) */
export const pokedexSources = ["앨범", "CU 리센느빵", "할리스", "MLB", "도미노피자"];

export const pokedexSets: Record<string, PokedexSet> = {
  "Re:Scene": {
    how: "싱글 1집 · 2024.03.26 · 포토북 2종(포토카드 A·B 각 5종 중 랜덤 1장), PLVE 2종(셀카 포토카드 5종 중 랜덤 1장)",
    link: "https://rescene.fandom.com/wiki/Re:Scene",
  },
  Dearest: {
    how: "싱글 2집 · 2025.07.02 · 포토북(포토카드 10종 중 랜덤 2장), QR 버전(셀카 20종 중 랜덤 3장 + 콘셉트 5종 중 1장)",
    note: "포토북 10종·셀카 20종은 멤버별 같은 장수로 나눈 추정 구성이에요.",
    link: "https://rescene.fandom.com/wiki/Dearest",
  },
  PULSE: {
    how: "미니 4집 · 2026.11.03 · Standard(포토카드 10종 중 2장 + 유닛 5종 중 1장), Limited(10종 중 2장), Wappen(5종 중 1장), QR(셀카 15종 중 3장)",
    note: "발매 전 판매처 구성표 기준이에요. Guardian 버전 포토카드 세트, QR 랜덤 포토카드는 구성이 공개되면 추가할게요.",
    link: "https://www.kpoptown.com/brand/147-rescene",
  },
  "CU 리센느빵 1탄": {
    how: "CU 'BAKE405 리센느빵' 5종에 투명 포토카드 27종 중 랜덤 1장 · 2026.09.17~",
    note: "멤버별 4장 + 단체·스페셜 7장은 팬 정리 기준이에요(공식 미공개). 10월 26일부터 2탄(28종)으로 바뀌며, 2탄은 구성이 공개되면 추가할게요.",
    link: "https://zdnet.co.kr/view/?no=20260915091011",
  },
  "할리스 리센느 세트 증정": {
    how: "할리스 매장에서 멤버별 리센느 세트(13,500원) 구매 시 5종 중 랜덤 1장 · 2026.08.26~소진 시",
    link: "https://m.hollys.co.kr/news/eventView.do?idx=555",
  },
  "도미노피자 방문포장 증정": {
    how: "도미노피자 앱 방문포장으로 프리미엄 피자(L) 주문 시 멤버 5종 중 랜덤 1장 · 2026.08 · 선착순",
    link: "https://news.nate.com/view/20260803n08841",
  },
  "MLB 미야옹비니 증정": {
    how: "MLB 26FW 비니 캠페인 · 2026.10.07~ · 구매 고객에게 화보 포토카드 랜덤 증정, 홀로그램 스페셜 카드 랜덤",
    note: "보도에 나온 화보 멤버 4명(리브·미나미·메이·제나) 기준 추정 구성이에요.",
    link: "https://www.wikitree.co.kr/articles/1165467",
  },
};

/** 카드의 출처 링크: 카드에 따로 적힌 링크가 먼저, 없으면 세트 링크 */
export function cardSourceUrl(card: Pick<CatalogCard, "album" | "source_url">) {
  return card.source_url || pokedexSets[card.album]?.link;
}
