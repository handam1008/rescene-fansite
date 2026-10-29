"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Messages } from "./messages";

/** 브라우저 컴포넌트에서 쓰는 언어·문구. layout 에서 지금 언어의 문구만 내려줌 */
const I18nContext = createContext<{ locale: Locale; m: Messages } | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, m: messages }}>{children}</I18nContext.Provider>;
}

/** const { m, locale } = useI18n(); m.nav.home */
export function useI18n() {
  const v = useContext(I18nContext);
  if (!v) throw new Error("I18nProvider 안에서 써야 해요");
  return v;
}
