import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollTopButton from "@/components/ScrollTopButton";
import { LeftRail, RightRail } from "@/components/SideRails";
import TopBar from "@/components/TopBar";
import { SITE_URL } from "@/lib/site-url";
// Pretendard 폰트 (필요한 글자 조각만 내려받는 방식, OFL 라이선스)
import "./fonts/pretendard/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// 제목·로고: 마루 부리 (네이버, OFL). 제목은 늘 굵게 쓰여서 Bold 한 벌을 600~900 굵기에 씀
const maruBuri = localFont({
  src: "./fonts/maruburi/MaruBuri-Bold.woff2",
  weight: "600 900",
  variable: "--font-maru",
  display: "swap",
});

// 게시판 글 제목: 페이퍼로지 (OFL). 게시판 화면에서만 쓰여서 미리 받지 않음
const paperlogy = localFont({
  src: [
    { path: "./fonts/paperlogy/Paperlogy-5Medium.woff2", weight: "400 500" },
    { path: "./fonts/paperlogy/Paperlogy-7Bold.woff2", weight: "600 900" },
  ],
  variable: "--font-paper",
  display: "swap",
  preload: false,
});

const SITE_NAME = "RESCENE 팬사이트 (비공식)";
const DESCRIPTION = "리센느(RESCENE) 비공식 팬사이트 💜 컴백 일정 달력 · 다 같이 채우는 포카 도감 · 리마인 게시판";

export const metadata: Metadata = {
  // 공유 미리보기의 이미지 주소를 절대 주소로 만들 때 쓰는 기준 주소
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  // 디스코드·카톡·트위터 미리보기 (대표 이미지는 app/opengraph-image.tsx)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

// 사이드바의 인기글·다가오는 일정이 정적 페이지에서도 5분마다 새로 고쳐지도록
export const revalidate = 300;

export const viewport: Viewport = {
  // 디스코드 미리보기 왼쪽 띠 색, 휴대폰 브라우저 주소창 색
  themeColor: "#9b84d9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${maruBuri.variable} ${paperlogy.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <TopBar />
        <Header />
        {/* 넓은 PC 화면: 왼쪽 인기글 | 본문 | 오른쪽 다가오는 일정 */}
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:pt-10 wide:grid wide:max-w-[1520px] wide:grid-cols-[224px_minmax(0,1fr)_224px] wide:items-start wide:gap-6">
          <LeftRail />
          <main className="min-w-0">{children}</main>
          <RightRail />
        </div>
        <Footer />
        <ScrollTopButton />
      </body>
    </html>
  );
}
