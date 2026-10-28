import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getNews } from "@/lib/news";
import { kstDateKey } from "@/lib/schedule";

export const metadata: Metadata = { title: "뉴스" };

// 새 기사를 30분마다 다시 가져옴
export const revalidate = 1800;

const timeFmt = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function NewsPage() {
  const news = await getNews(60);
  // 한국 날짜별로 묶기
  const byDay = new Map<string, typeof news>();
  for (const n of news) {
    const k = kstDateKey(n.published);
    byDay.set(k, [...(byDay.get(k) ?? []), n]);
  }

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="뉴스"
        description="리센느 기사를 모아봐요. 30분마다 자동으로 새로 가져오고, 제목을 누르면 기사 원문으로 이동해요."
      />
      {news.length === 0 ? (
        <EmptyState>기사를 불러오지 못했어요. 잠시 후 다시 와주세요.</EmptyState>
      ) : (
        <div className="space-y-6">
          {[...byDay.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-bold text-lilac-700">{formatDate(`${day}T12:00:00+09:00`)}</h2>
              <ul className="card divide-y divide-lilac-100">
                {items.map((n) => (
                  <li key={n.url}>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 px-4 py-3 hover:bg-lilac-50">
                      <span className="w-11 shrink-0 pt-0.5 text-xs text-ink-soft tabular-nums">{timeFmt.format(new Date(n.published))}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{n.title}</span>
                        <span className="block text-xs text-ink-soft">{n.source}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-xs text-ink-soft">기사 제목·언론사·시각만 보여주고 본문은 각 언론사 사이트에서 봐요 (출처: 구글 뉴스 검색).</p>
        </div>
      )}
    </>
  );
}
