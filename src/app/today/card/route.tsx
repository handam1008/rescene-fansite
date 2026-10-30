import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
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

// 한글은 Pretendard, 일본어는 Pretendard JP (이미지 생성기는 woff2 를 못 읽어서 otf)
const KR = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-";
const JP = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard-jp/dist/public/static/PretendardJP-";
async function load(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${res.status} ${url}`);
  return res.arrayBuffer();
}

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill={color} />
    </svg>
  );
}

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

  const fonts = await Promise.all([load(`${KR}Bold.otf`), load(`${KR}ExtraBold.otf`)]);
  const jp = locale === "ja" ? await Promise.all([load(`${JP}Bold.otf`), load(`${JP}ExtraBold.otf`)]) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          fontFamily: jp ? "Pretendard, PretendardJP" : "Pretendard",
          color: INK,
          backgroundColor: "#f8f5ff",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, #ffd3e4 0%, rgba(255,211,228,0) 45%), radial-gradient(circle at 100% 0%, #cbe6ff 0%, rgba(203,230,255,0) 45%), radial-gradient(circle at 100% 100%, #e0d4ff 0%, rgba(224,212,255,0) 55%)",
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
      fonts: [
        { name: "Pretendard", data: fonts[0], weight: 700, style: "normal" },
        { name: "Pretendard", data: fonts[1], weight: 800, style: "normal" },
        ...(jp
          ? [
              { name: "PretendardJP", data: jp[0], weight: 700 as const, style: "normal" as const },
              { name: "PretendardJP", data: jp[1], weight: 800 as const, style: "normal" as const },
            ]
          : []),
      ],
      // 10분마다 새로 (날짜·일정이 바뀌므로)
      headers: { "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=600" },
    },
  );
}
