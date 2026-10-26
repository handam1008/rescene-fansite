/**
 * 홈 상단 큰 박스(히어로) 설정.
 *
 * 사진 넣는 법: 사진 파일을 public/images/ 폴더에 넣고 image에 "/images/파일이름.jpg" 처럼 적어주세요.
 * 비워두면 사진 자리에 은은한 그라데이션이 보입니다.
 */
export const hero = {
  title: "RESCENE",
  /** 괄호 안의 영어(RE, SCENE)는 강조 색으로 표시됩니다 */
  tagline: "향기로 다시(RE) 장면(SCENE)을 떠올린다.",
  image: "",
  imageAlt: "리센느 멤버 사진",
  /**
   * 사진에서 박스에 맞춰 보여줄 기준점. "right center" = 오른쪽 가운데.
   * 얼굴이 잘리면 "right top", "80% 30%" 처럼 바꿔보세요.
   */
  imagePosition: "right center",
  /** 사진 출처 (예: "사진: 더뮤즈엔터테인먼트"). 비우면 표시 안 함 */
  imageCredit: "",
};
