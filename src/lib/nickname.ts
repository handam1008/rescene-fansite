/**
 * 닉네임 규칙: 한글·영문·숫자 2~20자 (띄어쓰기·특수문자·보이지 않는 글자 금지).
 * DB 의 public.nickname_format_ok (supabase/migrations/0011) 와 똑같이 맞춰야 합니다.
 * 화면에 보여주는 규칙 문구는 i18n/messages/account.ts 의 nickRule.
 */
export const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]{2,20}$/;

export function nicknameFormatOk(n: string) {
  return NICKNAME_PATTERN.test(n);
}
