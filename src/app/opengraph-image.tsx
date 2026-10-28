import { ImageResponse } from "next/og";
import { comebacks } from "@/data/comeback";
import { members } from "@/data/members";
import { songs } from "@/data/songs";

/*
 * 링크를 공유하면(디스코드·카톡·트위터 등) 뜨는 대표 이미지 1200×630.
 * 공식 사진은 쓰지 않고(저작권) 사이트 색감·글자로만 만들며, 컴백 D-day 는 매시간 새로 계산합니다.
 * 하위 페이지는 따로 정하지 않으면 이 이미지를 같이 씁니다.
 */

export const alt = "RESCENE 팬사이트 (비공식) · 컴백 일정 · 포카 도감 · 게시판";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const INK = "#3d3558";
const INK_SOFT = "#6f6890";
const LILAC = "#9b84d9";
const LILAC_DEEP = "#6a55a8";

// 한글 글꼴 (Pretendard, OFL). 이미지 생성기는 woff2 를 못 읽어서 otf 를 받아 씀
const FONT = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-";
async function font(weight: "Medium" | "Bold" | "ExtraBold") {
  const res = await fetch(`${FONT}${weight}.otf`);
  if (!res.ok) throw new Error(`font ${weight} ${res.status}`);
  return res.arrayBuffer();
}

const kstDay = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

/** 오른쪽 카드에 넣을 소식: 다가오는 컴백 D-day, 발매 2주 안이면 "NOW OUT", 아니면 최신곡 */
function headline(now: Date) {
  const cb = comebacks[0];
  if (cb) {
    const days = Math.round((Date.parse(kstDay(cb.releaseDate)) - Date.parse(kstDay(now))) / 86_400_000);
    // "11.3 (화) 18:00"
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "numeric",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date(cb.releaseDate))
        .map((x) => [x.type, x.value]),
    );
    const when = `${p.month}.${p.day} (${p.weekday}) ${p.hour}:${p.minute} 발매`;
    const track = `타이틀곡 ${cb.titleTrack}`;
    if (days > 0) return { kicker: "COMEBACK", big: `D-${days}`, title: cb.albumTitle, sub: when, sub2: track };
    if (days === 0) return { kicker: "COMEBACK", big: "D-DAY", title: cb.albumTitle, sub: "오늘 발매", sub2: track };
    if (days > -14) return { kicker: "NOW OUT", big: cb.titleTrack, title: cb.albumTitle, sub: "지금 들으러 가요", sub2: "" };
  }
  const latest = songs.filter((s) => !s.isSample && new Date(s.releaseDate) <= now).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];
  return { kicker: "LATEST", big: latest?.title ?? "RESCENE", title: latest?.album ?? "", sub: "최신곡", sub2: "" };
}

/** 반짝이 모양 (✦ 글자는 글꼴에 없어서 직접 그림) */
function Sparkle({ size: s, color }: { size: number; color: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill={color} />
    </svg>
  );
}

export default async function OpengraphImage() {
  const news = headline(new Date());
  const [medium, bold, extra] = await Promise.all([font("Medium"), font("Bold"), font("ExtraBold")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          fontFamily: "Pretendard",
          color: INK,
          backgroundColor: "#f8f5ff",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, #ffd3e4 0%, rgba(255,211,228,0) 45%), radial-gradient(circle at 100% 0%, #cbe6ff 0%, rgba(203,230,255,0) 45%), radial-gradient(circle at 100% 100%, #e0d4ff 0%, rgba(224,212,255,0) 55%)",
        }}
      >
        {/* 위: 사이트 이름 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700, color: LILAC_DEEP }}>
          <Sparkle size={30} color={LILAC} />
          RESCENE 팬사이트
          <span style={{ fontSize: 22, fontWeight: 500, color: INK_SOFT, marginLeft: 6 }}>비공식</span>
        </div>

        {/* 가운데: 큰 글씨 + 오른쪽 소식 카드 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>RESCENE</div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 32, fontWeight: 500, color: INK_SOFT }}>
              향기로 다시(RE) 장면(SCENE)을 떠올린다
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 330,
              padding: "26px 30px",
              backgroundColor: "rgba(255,255,255,0.82)",
              border: `3px solid ${LILAC}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 800, letterSpacing: 3, color: LILAC }}>{news.kicker}</div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: LILAC_DEEP }}>{news.big}</div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>{news.title}</div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 22, fontWeight: 500, color: INK_SOFT }}>{news.sub}</div>
            {news.sub2 && <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: INK }}>{news.sub2}</div>}
          </div>
        </div>

        {/* 아래: 멤버 + 기능 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {members.map((m) => (
              <div key={m.slug} style={{ display: "flex", padding: "8px 18px", fontSize: 26, fontWeight: 700, backgroundColor: m.color }}>
                {m.name}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 24, fontWeight: 700, color: INK_SOFT }}>
            <span>일정 달력</span>
            <span style={{ color: LILAC }}>·</span>
            <span>포카 도감</span>
            <span style={{ color: LILAC }}>·</span>
            <span>팬 게시판</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: extra, weight: 800, style: "normal" },
      ],
    },
  );
}
