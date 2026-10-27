import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-lilac-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs leading-relaxed text-ink-soft">
        <p className="font-medium">
          이 사이트는 팬이 만든 비공식 팬사이트이며, 소속사와 관련이 없습니다.
        </p>
        <p className="mt-1">
          음원·영상은 공식 채널의 임베드와 외부 링크로만 제공합니다.
        </p>
        <p className="mt-1">
          포카 도감 이미지는 회원이 직접 찍어 공개에 동의한 사진이며, 상업적으로 쓰지 않습니다. 권리자가 요청하면 바로
          내립니다.
        </p>
        <p className="mt-2 space-x-3">
          <Link href="/privacy" className="font-semibold text-ink underline">
            개인정보처리방침
          </Link>
          <Link href="/board/rules" className="underline">
            게시판 규칙
          </Link>
        </p>
      </div>
    </footer>
  );
}
