import type { Locale } from "@/i18n/config";

/**
 * 글이 화면 언어와 다른 언어로 쓰였는지 대충 판단 (번역 버튼을 보여줄지).
 * 한글·가나(한자 포함)·영문 글자 수를 세서 가장 많은 쪽을 그 글의 언어로 봄.
 * 한글·일본어 한 글자는 영문 여러 글자만큼의 뜻이라 3배로 셈 ("리센느 RESCENE 컴백 축하해요"는 한국어)
 * 이모지·숫자만 있는 글은 번역할 게 없어서 false.
 */
export function needsTranslation(text: string, locale: Locale) {
  const hangul = (text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g)?.length ?? 0) * 3;
  const japanese = (text.match(/[぀-ヿ一-鿿]/g)?.length ?? 0) * 3;
  // RESCENE·PULSE·MV 처럼 대문자로만 된 단어는 이름·약자라서 영어 글로 치지 않음
  const latin = text.replace(/\b[A-Z][A-Z0-9]+\b/g, "").match(/[A-Za-z]/g)?.length ?? 0;
  const top = Math.max(hangul, japanese, latin);
  if (top === 0) return false;
  const lang: Locale = top === hangul ? "ko" : top === japanese ? "ja" : "en";
  return lang !== locale;
}
