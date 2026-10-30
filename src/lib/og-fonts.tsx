import type { Locale } from "@/i18n/config";

/**
 * 공유 이미지(next/og)용 글꼴. 한글은 Pretendard, 일본어 화면이면 Pretendard JP 도 같이.
 * 이미지 생성기는 woff2 를 못 읽어서 otf 를 받아 씀
 */
const KR = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-";
const JP = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard-jp/dist/public/static/PretendardJP-";

async function load(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${res.status} ${url}`);
  return res.arrayBuffer();
}

export async function ogFonts(locale: Locale) {
  const [bold, extra] = await Promise.all([load(`${KR}Bold.otf`), load(`${KR}ExtraBold.otf`)]);
  const fonts = [
    { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Pretendard", data: extra, weight: 800 as const, style: "normal" as const },
  ];
  if (locale === "ja") {
    const [jb, je] = await Promise.all([load(`${JP}Bold.otf`), load(`${JP}ExtraBold.otf`)]);
    fonts.push(
      { name: "PretendardJP", data: jb, weight: 700, style: "normal" },
      { name: "PretendardJP", data: je, weight: 800, style: "normal" },
    );
  }
  return { fonts, fontFamily: locale === "ja" ? "Pretendard, PretendardJP" : "Pretendard" };
}

/** 반짝이 모양 (✦ 글자는 글꼴에 없어서 직접 그림) */
export function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill={color} />
    </svg>
  );
}

/** 공유 이미지 공통 배경 */
export const OG_BACKGROUND = {
  backgroundColor: "#f8f5ff",
  backgroundImage:
    "radial-gradient(circle at 0% 0%, #ffd3e4 0%, rgba(255,211,228,0) 45%), radial-gradient(circle at 100% 0%, #cbe6ff 0%, rgba(203,230,255,0) 45%), radial-gradient(circle at 100% 100%, #e0d4ff 0%, rgba(224,212,255,0) 55%)",
};
