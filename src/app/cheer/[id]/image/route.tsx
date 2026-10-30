import { ImageResponse } from "next/og";
import { getMember, nameOf } from "@/data/members";
import { fmt, isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { getPaper, getPaperMessages } from "@/lib/cheer";
import { OG_BACKGROUND, ogFonts, Sparkle } from "@/lib/og-fonts";

/* 롤링페이퍼 링크를 공유했을 때 미리보기 이미지 (1200×630): 주인 이름 + 응원 수 + 최근 쪽지 3장 */

const INK = "#3d3558";
const LILAC = "#9b84d9";
const LILAC_DEEP = "#6a55a8";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const raw = new URL(request.url).searchParams.get("lang");
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const m = dictionaries[locale];
  const { id } = await params;
  const paper = await getPaper(id);
  const { messages, count } = paper ? await getPaperMessages(id) : { messages: [], count: 0 };
  const { fonts, fontFamily } = await ogFonts(locale);
  const notes = messages.slice(0, 3);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "52px 60px", fontFamily, color: INK, ...OG_BACKGROUND }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 800, letterSpacing: 4, color: LILAC }}>
          <Sparkle size={28} color={LILAC} />
          PULSE CHEER
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
          {fmt(m.cheer.paperOf, { name: paper?.owner?.nickname ?? "REMINE" })}
        </div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 32, fontWeight: 800, color: LILAC_DEEP }}>
          💌 {fmt(m.cheer.count, { n: count })} · {m.cheer.ogInvite}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: "auto" }}>
          {notes.map((c, i) => {
            const member = getMember(c.member);
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 340,
                  height: 220,
                  padding: 20,
                  backgroundColor: member?.color ?? "#e0d4ff",
                  transform: `rotate(${[-2, 1.5, -1][i]}deg)`,
                }}
              >
                <div style={{ display: "flex", fontSize: 20, fontWeight: 700, opacity: 0.7 }}>To. {member ? nameOf(member, locale) : m.cheer.toAll}</div>
                <div style={{ display: "flex", marginTop: 8, fontSize: 28, fontWeight: 800, lineHeight: 1.3, overflow: "hidden" }}>
                  {c.content.length > 42 ? `${c.content.slice(0, 42)}…` : c.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=300" },
    },
  );
}
