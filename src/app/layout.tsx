import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ScrollTopButton from "@/components/ScrollTopButton";
import SitePresence from "@/components/SitePresence";
import { LeftRail, RightRail } from "@/components/SideRails";
import TopBar from "@/components/TopBar";
import { I18nProvider } from "@/i18n/client";
import { getI18n } from "@/i18n/server";
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

/** 사이트 이름·설명은 고른 언어로 (쿠키가 없는 검색 로봇·공유 미리보기는 한국어) */
export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return {
    // 공유 미리보기의 이미지 주소를 절대 주소로 만들 때 쓰는 기준 주소
    metadataBase: new URL(SITE_URL),
    title: {
      default: m.meta.siteName,
      template: `%s | ${m.meta.siteName}`,
    },
    description: m.meta.description,
    // 디스코드·카톡·트위터 미리보기 (대표 이미지는 app/opengraph-image.tsx)
    openGraph: {
      type: "website",
      locale: m.meta.ogLocale,
      siteName: m.meta.siteName,
      title: m.meta.siteName,
      description: m.meta.description,
    },
    twitter: { card: "summary_large_image" },
    // 구글 서치콘솔·네이버 서치어드바이저 소유 확인 (공개돼도 되는 값)
    verification: {
      google: "XTHC9f6yRfKUB3sxhRRAmHN15B2TEw7gQkBbbB-qpeU",
      other: { "naver-site-verification": "fe5fbb77894e2e1aea161b6d92fa1e98de661d7c" },
    },
  };
}

export const viewport: Viewport = {
  // 디스코드 미리보기 왼쪽 띠 색, 휴대폰 브라우저 주소창 색
  themeColor: "#9b84d9",
  // 아이폰 아래 홈 막대 영역까지 화면을 쓰고, 아래 고정 메뉴가 그만큼 위로 올라오게 (safe-area-inset)
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, m } = await getI18n();
  return (
    <html lang={locale} className={`${maruBuri.variable} ${paperlogy.variable}`}>
      <body className="flex min-h-dvh flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom))] antialiased sm:pb-0">
        <I18nProvider locale={locale} messages={m}>
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
          <BottomNav />
          <SitePresence />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
