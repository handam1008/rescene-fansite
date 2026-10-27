import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { LeftRail, RightRail } from "@/components/SideRails";
// Pretendard 폰트 (필요한 글자 조각만 내려받는 방식, OFL 라이선스)
import "./fonts/pretendard/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RESCENE 팬사이트 (비공식)",
    template: "%s | RESCENE 팬사이트 (비공식)",
  },
  description: "리센느(RESCENE) 컴백·신곡·투표 소식을 모아보는 비공식 팬사이트",
};

// 사이드바의 인기글·다가오는 일정이 정적 페이지에서도 5분마다 새로 고쳐지도록
export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#efe8ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex min-h-dvh flex-col antialiased">
        <Header />
        {/* 넓은 PC 화면: 왼쪽 인기글 | 본문 | 오른쪽 다가오는 일정 */}
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:pt-10 wide:grid wide:max-w-[1520px] wide:grid-cols-[224px_minmax(0,1fr)_224px] wide:items-start wide:gap-6">
          <LeftRail />
          <main className="min-w-0">{children}</main>
          <RightRail />
        </div>
        <Footer />
      </body>
    </html>
  );
}
