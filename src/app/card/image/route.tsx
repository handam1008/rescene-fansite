import { ImageResponse } from "next/og";
import { nameOf } from "@/data/members";
import { fmt, isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { OG_BACKGROUND, ogFonts, Sparkle } from "@/lib/og-fonts";
import { getCardData, parseCardParams } from "@/lib/remine-card";
import { SITE_URL } from "@/lib/site-url";

/*
 * 나만의 리마인 카드 이미지 (1080×1350).
 * 최애 멤버 사진은 public/images/members 의 얼굴 사진 (PULSE 콘셉트 포토를 잘라 쓴 것)
 */

const INK = "#3d3558";
const INK_SOFT = "#6f6890";
const LILAC = "#9b84d9";
const LILAC_DEEP = "#6a55a8";

async function photo(origin: string, path: string) {
  const res = await fetch(new URL(path, origin));
  if (!res.ok) return null;
  return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("lang");
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const m = dictionaries[locale].card;
  const card = await getCardData(parseCardParams((k) => url.searchParams.get(k)), locale);
  const [{ fonts, fontFamily }, photos] = await Promise.all([
    ogFonts(locale),
    Promise.all(card.fav.map((f) => photo(url.origin, f.image))),
  ]);
  // 최애가 많으면 사진을 작게
  const size = card.fav.length <= 2 ? 300 : card.fav.length === 3 ? 240 : card.fav.length === 4 ? 175 : 150;
  const accent = card.fav[0]?.color ?? "#e0d4ff";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 44, fontFamily, color: INK, ...OG_BACKGROUND }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 60px",
            backgroundColor: "rgba(255,255,255,0.78)",
            border: `6px solid ${accent}`,
          }}
        >
          {/* 위 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 34, fontWeight: 800, letterSpacing: 6, color: LILAC_DEEP }}>
              <Sparkle size={34} color={LILAC} />
              {m.cardTitle}
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: INK_SOFT, letterSpacing: 2 }}>RESCENE</div>
          </div>

          {/* 이름 + 칭호 */}
          <div style={{ display: "flex", marginTop: 54, fontSize: card.name.length > 10 ? 84 : 112, fontWeight: 800, lineHeight: 1.05 }}>{card.name}</div>
          {card.badges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
              {card.badges.map((b) => (
                <div key={b} style={{ display: "flex", padding: "8px 18px", fontSize: 28, fontWeight: 800, color: "#fff", backgroundColor: LILAC }}>
                  {b}
                </div>
              ))}
            </div>
          )}

          {/* 최애 */}
          <div style={{ display: "flex", marginTop: 52, fontSize: 28, fontWeight: 800, letterSpacing: 4, color: LILAC }}>{m.cardFav}</div>
          {card.fav.length === 0 ? (
            <div style={{ display: "flex", marginTop: 16, fontSize: 56, fontWeight: 800, color: LILAC_DEEP }}>{m.cardNoFav}</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 26, marginTop: 20 }}>
              {card.fav.map((f, i) => (
                <div key={f.slug} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  {photos[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- 이미지 생성기 안의 사진
                    <img src={photos[i]!} width={size} height={size} style={{ borderRadius: 9999, border: `8px solid ${f.color}`, objectFit: "cover" }} alt="" />
                  ) : (
                    <div style={{ display: "flex", width: size, height: size, borderRadius: 9999, backgroundColor: f.color }} />
                  )}
                  <div style={{ display: "flex", fontSize: size > 200 ? 40 : 32, fontWeight: 800 }}>{nameOf(f, locale)}</div>
                </div>
              ))}
            </div>
          )}

          {/* 포카 기록 */}
          {card.collected !== undefined && (
            <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
              <div style={{ display: "flex", padding: "16px 24px", fontSize: 32, fontWeight: 800, backgroundColor: "#f1ebff", color: LILAC_DEEP }}>
                📸 {fmt(m.cardCollected, { n: card.collected })}
              </div>
              {!!card.pioneer && (
                <div style={{ display: "flex", padding: "16px 24px", fontSize: 32, fontWeight: 800, backgroundColor: "#fff1f6", color: "#c2417a" }}>
                  🏅 {fmt(m.cardPioneer, { n: card.pioneer })}
                </div>
              )}
            </div>
          )}

          {/* 리센느 소개 한 줄 */}
          <div style={{ display: "flex", marginTop: "auto", fontSize: 30, fontWeight: 700, color: LILAC }}>{dictionaries[locale].hero.tagline}</div>

          {/* 아래 */}
          <div style={{ display: "flex", marginTop: 28, alignItems: "center", justifyContent: "space-between", fontSize: 28, fontWeight: 700 }}>
            <div style={{ display: "flex", color: INK_SOFT }}>{m.cardMake} →</div>
            <div style={{ display: "flex", color: LILAC_DEEP }}>{SITE_URL.replace(/^https?:\/\//, "")}/card</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
      headers: { "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=600" },
    },
  );
}
