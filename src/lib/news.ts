/**
 * 뉴스: 구글 뉴스 검색 RSS("리센느")에서 기사 제목·언론사·날짜만 가져와 원래 기사로 연결.
 * 기사 본문은 가져오지 않음 (저작권). 30분 동안 저장해 두고 씀
 */

export type NewsItem = { title: string; source: string; url: string; published: string };

const FEED = `https://news.google.com/rss/search?q=${encodeURIComponent("리센느")}&hl=ko&gl=KR&ceid=KR:ko`;

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export async function getNews(limit = 40): Promise<NewsItem[]> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const seen = new Set<string>();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .flatMap(([, it]) => {
        const rawTitle = /<title>([\s\S]*?)<\/title>/.exec(it)?.[1];
        const url = /<link>([^<]+)<\/link>/.exec(it)?.[1];
        const date = /<pubDate>([^<]+)<\/pubDate>/.exec(it)?.[1];
        if (!rawTitle || !url || !date) return [];
        const source = decode(/<source[^>]*>([\s\S]*?)<\/source>/.exec(it)?.[1] ?? "");
        let title = decode(rawTitle);
        // 구글 뉴스 제목 끝의 " - 언론사" 떼기
        if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
        // 리센느 기사만 (검색어가 다른 말에 걸린 기사 빼기), 같은 제목은 한 번만
        if (!/리센느|RESCENE/i.test(title) || seen.has(title)) return [];
        seen.add(title);
        return [{ title, source, url, published: new Date(date).toISOString() }];
      })
      .sort((a, b) => b.published.localeCompare(a.published))
      .slice(0, limit);
  } catch {
    return [];
  }
}
