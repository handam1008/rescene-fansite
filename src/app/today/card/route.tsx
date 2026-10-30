import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { OG_BACKGROUND, ogFonts, Sparkle } from "@/lib/og-fonts";
import { SITE_URL } from "@/lib/site-url";
import { getTodayCard } from "@/lib/today";

/*
 * "오늘의 리센느" 카드 이미지 (1080×1350, 인스타·X 에 잘 맞는 세로형).
 * /today/card?lang=ja 처럼 언어를 고름. 공식 사진은 쓰지 않고 글자·색으로만 만듦 (저작권)
 */

const W = 1080;
const H = 1350;
const INK = "#3d3558";
const INK_SOFT = "#6f6890";
const LILAC = "#9b84d9";
const LILAC_DEEP = "#6a55a8";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: LILAC_DEEP, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

const row = { display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 700, padding: "12px 0", borderBottom: "2px solid #e6dcff" } as const;
const tag = { display: "flex", flexShrink: 0, fontSize: 26, fontWeight: 700, color: INK_SOFT } as const;
const text = { display: "flex", flex: 1, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" };

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("lang");
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const m = dictionaries[locale].today;
  const card = await getTodayCard(locale);

  const { fonts, fontFamily } = await ogFonts(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          fontFamily,
          color: INK,
          ...OG_BACKGROUND,
        }}
      >
        {/* 위: 제목 + 날짜 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 52, fontWeight: 800 }}>
            <Sparkle size={44} color={LILAC} />
            {m.title}
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: LILAC_DEEP }}>{card.dateLabel}</div>
        </div>

        {/* 컴백 D-day */}
        {card.comeback && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 40,
              padding: "28px 36px",
              backgroundColor: "rgba(255,255,255,0.85)",
              border: `4px solid ${LILAC}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 4, color: LILAC }}>{card.comeback.kicker}</div>
              <div style={{ display: "flex", fontSize: 46, fontWeight: 800 }}>{card.comeback.album}</div>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: INK_SOFT }}>{card.comeback.when}</div>
            </div>
            <div style={{ display: "flex", fontSize: 120, fontWeight: 800, color: LILAC_DEEP, lineHeight: 1 }}>{card.comeback.big}</div>
          </div>
        )}

        {/* 오늘 일정 */}
        <Section title={m.cardToday}>
          {card.today.length === 0 ? (
            <div style={{ ...row, color: INK_SOFT }}>{m.cardNoToday}</div>
          ) : (
            card.today.map((e, i) => (
              <div key={i} style={row}>
                {e.time && <div style={{ ...tag, color: LILAC_DEEP }}>{e.time}</div>}
                <div style={text}>{e.title}</div>
              </div>
            ))
          )}
        </Section>

        {/* 다가오는 일정 */}
        {card.next.length > 0 && (
          <Section title={m.cardUpcoming}>
            {card.next.map((e, i) => (
              <div key={i} style={row}>
                <div style={tag}>{e.date}</div>
                <div style={text}>{e.title}</div>
              </div>
            ))}
          </Section>
        )}

        {/* 투표 마감 */}
        {card.closing.length > 0 && (
          <Section title={m.cardVotes}>
            {card.closing.map((v, i) => (
              <div key={i} style={row}>
                <div style={text}>{v.title}</div>
                <div style={{ ...tag, color: "#d6457a" }}>{v.ends}</div>
              </div>
            ))}
          </Section>
        )}

        {/* 아래: 사이트 주소 */}
        <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", fontSize: 28, fontWeight: 700 }}>
          <div style={{ display: "flex", color: LILAC_DEEP }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
          <div style={{ display: "flex", color: INK_SOFT }}>RESCENE · {m.cardSite}</div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts,
      // 10분마다 새로 (날짜·일정이 바뀌므로)
      headers: { "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=600" },
    },
  );
}
