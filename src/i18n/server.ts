import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./messages";

/** 서버 컴포넌트에서 지금 언어 (쿠키). 한 요청 안에서는 한 번만 읽음 */
export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
});

/** 서버 컴포넌트에서: const { m, locale } = await getI18n(); m.nav.home */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, m: dictionaries[locale] };
}
