"use server";

import { getI18n } from "@/i18n/server";
import { isTranslationEnabled, translate, TranslateError } from "@/lib/translate";
import { createClient } from "@/lib/supabase/server";

export type TranslateResult = { title?: string; text?: string; error?: string };

/**
 * 글·댓글을 지금 화면 언어로 번역.
 * 번역할 문장은 브라우저가 보낸 걸 쓰지 않고 DB 에서 직접 읽음 (아무 문장이나 번역해서 한도를 쓰지 못하게, 볼 수 없는 글은 번역 안 됨)
 */
export async function translateItem(kind: "post" | "comment", id: number): Promise<TranslateResult> {
  const { locale, m } = await getI18n();
  if (!isTranslationEnabled || !Number.isInteger(id) || id < 1) return { error: m.board.trError };

  const supabase = await createClient();
  try {
    if (kind === "post") {
      const { data } = await supabase.from("posts").select("title, content").eq("id", id).maybeSingle();
      if (!data) return { error: m.board.trError };
      const [title, text] = await Promise.all([translate(data.title, locale), translate(data.content, locale)]);
      return { title, text };
    }
    const { data } = await supabase.from("comments").select("content").eq("id", id).maybeSingle();
    if (!data) return { error: m.board.trError };
    return { text: await translate(data.content, locale) };
  } catch (e) {
    return { error: e instanceof TranslateError && e.reason === "quota" ? m.board.trQuota : m.board.trError };
  }
}
