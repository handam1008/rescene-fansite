// 서버에서만 씀 (키가 브라우저로 가지 않게 클라이언트 컴포넌트에서 가져오지 마세요)
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/config";
import { needsTranslation } from "@/lib/translate-detect";

/**
 * 게시판 글·댓글 번역 (DeepL API).
 * Vercel 환경 변수 DEEPL_API_KEY 가 있을 때만 켜짐. 키는 DeepL 계정 → API Keys 에서 받아 Vercel 에만 넣기.
 * Free 키(끝이 ":fx")는 api-free.deepl.com, 그 외는 api.deepl.com 으로 보냄.
 * 같은 문장·같은 언어는 서버 캐시에 남겨서 한 번만 번역 (글을 고치면 문장이 달라져서 다시 번역)
 */
const API_KEY = process.env.DEEPL_API_KEY ?? "";

export const isTranslationEnabled = API_KEY.length > 0;

const TARGET: Record<Locale, string> = { ko: "KO", ja: "JA", en: "EN-US" };

export class TranslateError extends Error {
  constructor(public readonly reason: "quota" | "failed") {
    super(reason);
  }
}

async function callDeepL(text: string, locale: Locale): Promise<string> {
  const host = API_KEY.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const res = await fetch(`${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [text], target_lang: TARGET[locale], preserve_formatting: true }),
    cache: "no-store",
    // DeepL 이 느려도 게시판 목록이 오래 멈추지 않게
    signal: AbortSignal.timeout(5000),
  });
  // 456: 이번 달 무료 한도를 다 씀
  if (res.status === 456) throw new TranslateError("quota");
  if (!res.ok) throw new TranslateError("failed");
  const data = (await res.json()) as { translations?: { text: string }[] };
  const out = data.translations?.[0]?.text;
  if (typeof out !== "string") throw new TranslateError("failed");
  return out;
}

/** 한 문장(글 제목·본문·댓글)을 화면 언어로 번역. 실패하면 TranslateError */
export async function translate(text: string, locale: Locale): Promise<string> {
  if (!text.trim()) return text;
  const hash = createHash("sha256").update(text).digest("hex");
  return unstable_cache(() => callDeepL(text, locale), ["deepl", locale, hash], { revalidate: false })();
}

/**
 * 게시판 목록용: 화면 언어와 다른 언어로 쓴 글 제목만 골라 번역 (글 id → 번역된 제목).
 * 번역이 안 되면(키 없음·한도·오류) 그 글은 빠지고 원래 제목이 그대로 보임
 */
export async function translateTitles(posts: { id: number; title: string }[], locale: Locale) {
  const out = new Map<number, string>();
  if (!isTranslationEnabled) return out;
  await Promise.all(
    posts.map(async (p) => {
      if (!needsTranslation(p.title, locale)) return;
      try {
        out.set(p.id, await translate(p.title, locale));
      } catch {
        // 원래 제목으로
      }
    }),
  );
  return out;
}
