import { LiveBadge } from "./LiveStatus";
import VisitorCounter from "./VisitorCounter";

/** 헤더 위 얇은 줄: 왼쪽 방문자 수, 오른쪽 LIVE 버튼 (스크롤하면 위로 사라지고 헤더만 따라옴) */
export default function TopBar() {
  return (
    <div className="border-b border-lilac-100 bg-white/50 text-xs text-ink-soft">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 xl:px-6 wide:max-w-[1520px]">
        <VisitorCounter />
        <LiveBadge />
      </div>
    </div>
  );
}
