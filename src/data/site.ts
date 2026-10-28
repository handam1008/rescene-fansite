/**
 * 홈 상단 큰 박스(히어로) 설정.
 *
 * 사진은 몇 초마다 다음 장으로 바뀝니다 (slides 순서대로).
 * 사진 넣는 법: 가로:세로 2:1 로 자른 단체 사진(가로 2400px 권장)을 public/images/hero/ 에 넣고 slides 에 한 줄 추가.
 * 휴대폰은 2:1 그대로, PC 는 조금 더 납작하게(12:5) 잘리니 얼굴이 잘리면 position 을 "center top" 등으로.
 * RESCENE 글씨가 왼쪽 아래에 겹치므로, 왼쪽 아래에 얼굴이 있는 사진은 피해주세요.
 * slides 를 비우면 사진 자리에 은은한 그라데이션이 보입니다.
 */
export type HeroSlide = {
  image: string;
  alt: string;
  /** PC 에서 잘릴 때 기준점. "center bottom" = 아래쪽을 남김 */
  position: string;
  /** 사진 출처 */
  credit: string;
};

const PULSE = "사진: 더뮤즈엔터테인먼트 (미니 4집 'PULSE' 콘셉트 포토)";
const PRETTY_GIRL = "사진: 더뮤즈엔터테인먼트 (스페셜 싱글 'Pretty Girl' 콘셉트 포토)";

export const hero: { title: string; tagline: string; slides: HeroSlide[] } = {
  title: "RESCENE",
  tagline: "향기로 다시(RE) 장면(SCENE)을 떠올린다",
  slides: [
    {
      image: "/images/hero/pulse-car.jpg",
      alt: "하얀 깃털로 덮인 자동차 앞에 나란히 앉은 리센느 다섯 멤버",
      position: "center bottom",
      credit: PULSE,
    },
    {
      image: "/images/hero/pulse-blue.jpg",
      alt: "푸른 빛 속에서 하얀 원피스를 입은 리센느 다섯 멤버",
      position: "center top",
      credit: PULSE,
    },
    {
      image: "/images/hero/pulse-box.jpg",
      alt: "회색 공간에 날개를 달고 나란히 선 리센느 다섯 멤버",
      position: "center top",
      credit: PULSE,
    },
    {
      image: "/images/hero/prettygirl-room.jpg",
      alt: "분홍색 방 침대 위에 모인 리센느 다섯 멤버",
      position: "center top",
      credit: PRETTY_GIRL,
    },
  ],
};
