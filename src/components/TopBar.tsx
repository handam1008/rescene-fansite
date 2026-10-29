import { dictionaries } from "@/i18n/messages";
import { LanguageSuggestion, LanguageSwitcher } from "./LanguageSwitcher";
import { LiveBadge } from "./LiveStatus";
import VisitorCounter from "./VisitorCounter";

// 처음 온 일본어·영어 브라우저에 보여줄 제안 (그 언어로 써야 해서 여기서 골라 넘김)
const suggestions = {
  ja: { question: dictionaries.ja.top.suggest, yes: dictionaries.ja.top.suggestYes, close: dictionaries.ja.top.close },
  en: { question: dictionaries.en.top.suggest, yes: dictionaries.en.top.suggestYes, close: dictionaries.en.top.close },
};

/** 헤더 위 얇은 줄: 왼쪽 방문자 수, 오른쪽 언어·LIVE (스크롤하면 위로 사라지고 헤더만 따라옴) */
export default function TopBar() {
  return (
    <>
      <LanguageSuggestion suggestions={suggestions} />
      <div className="border-b border-lilac-100 bg-white/50 text-xs text-ink-soft">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 xl:px-6 wide:max-w-[1520px]">
          <VisitorCounter />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <LiveBadge />
          </div>
        </div>
      </div>
    </>
  );
}
