import type { Locale } from "@/i18n/config";

/**
 * 홈 상단 큰 박스(히어로) 설정.
 *
 * 사진은 몇 초마다 다음 장으로 바뀝니다 (slides 순서대로).
 * 사진 넣는 법: 가로:세로 2:1 로 자른 단체 사진(가로 2400px 권장)을 public/images/hero/ 에 넣고 slides 에 한 줄 추가.
 * 휴대폰은 2:1 그대로, PC 는 조금 더 납작하게(12:5) 잘리니 얼굴이 잘리면 position 을 "center top" 등으로.
 * RESCENE 글씨가 왼쪽 아래에 겹치므로, 왼쪽 아래에 얼굴이 있는 사진은 피해주세요.
 * slides 를 비우면 사진 자리에 은은한 그라데이션이 보입니다.
 */
type L10n = Record<Locale, string>;

export type HeroSlide = {
  image: string;
  /** 사진 설명 (화면 읽기 프로그램용), 언어별 */
  alt: L10n;
  /** PC 에서 잘릴 때 기준점. "center bottom" = 아래쪽을 남김 */
  position: string;
  /** 사진 출처, 언어별 */
  credit: L10n;
};

const PULSE: L10n = {
  ko: "사진: 더뮤즈엔터테인먼트 (미니 4집 'PULSE' 콘셉트 포토)",
  ja: "写真：THE MUZE エンターテインメント（4thミニアルバム『PULSE』コンセプトフォト）",
  en: "Photo: THE MUZE Entertainment (4th Mini Album 'PULSE' concept photo)",
};
const PRETTY_GIRL: L10n = {
  ko: "사진: 더뮤즈엔터테인먼트 (스페셜 싱글 'Pretty Girl' 콘셉트 포토)",
  ja: "写真：THE MUZE エンターテインメント（スペシャルシングル『Pretty Girl』コンセプトフォト）",
  en: "Photo: THE MUZE Entertainment (Special Single 'Pretty Girl' concept photo)",
};

/** 멤버 프로필 사진(public/images/members/)도 'PULSE' 개인 콘셉트 포토에서 얼굴 부분만 잘라 씀 */
export const PULSE_PHOTO_CREDIT = PULSE;

/** 문구(tagline)는 언어별로 src/i18n/messages/shell.ts 의 hero.tagline */
export const hero: { title: string; slides: HeroSlide[] } = {
  title: "RESCENE",
  slides: [
    {
      image: "/images/hero/pulse-car.jpg",
      alt: {
        ko: "하얀 깃털로 덮인 자동차 앞에 나란히 앉은 리센느 다섯 멤버",
        ja: "白い羽根に覆われた車の前に並んで座るRESCENEの5人",
        en: "The five members of RESCENE sitting in front of a car covered in white feathers",
      },
      position: "center bottom",
      credit: PULSE,
    },
    {
      image: "/images/hero/pulse-blue.jpg",
      alt: {
        ko: "푸른 빛 속에서 하얀 원피스를 입은 리센느 다섯 멤버",
        ja: "青い光の中で白いワンピースを着たRESCENEの5人",
        en: "The five members of RESCENE in white dresses under blue light",
      },
      position: "center top",
      credit: PULSE,
    },
    {
      image: "/images/hero/pulse-box.jpg",
      alt: {
        ko: "회색 공간에 날개를 달고 나란히 선 리센느 다섯 멤버",
        ja: "グレーの空間で翼をつけて並んで立つRESCENEの5人",
        en: "The five members of RESCENE standing in a row with wings in a gray room",
      },
      position: "center top",
      credit: PULSE,
    },
    {
      image: "/images/hero/prettygirl-room.jpg",
      alt: {
        ko: "분홍색 방 침대 위에 모인 리센느 다섯 멤버",
        ja: "ピンクの部屋のベッドに集まったRESCENEの5人",
        en: "The five members of RESCENE gathered on a bed in a pink room",
      },
      position: "center top",
      credit: PRETTY_GIRL,
    },
  ],
};
