import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:pt-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
