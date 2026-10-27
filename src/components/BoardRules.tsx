import Link from "next/link";
import { boardRules, RULES_UPDATED, ruleSanctions } from "@/data/board-rules";

/** 게시판 규칙 전체 (/board/rules) */
export function BoardRulesFull() {
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {boardRules.map((rule, i) => (
          <li key={rule.title} className="card p-4">
            <h2 className="font-bold">
              <span className="mr-2 text-lilac-500 tabular-nums">{i + 1}.</span>
              {rule.title}
            </h2>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-ink-soft">
              {rule.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <section className="border-l-4 border-lilac-500 bg-lilac-50 p-4 text-sm">
        <h2 className="mb-1.5 font-bold">규칙을 어기면</h2>
        <ul className="list-inside list-disc space-y-0.5 text-ink-soft">
          {ruleSanctions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-soft">{RULES_UPDATED} 기준</p>
      </section>
    </div>
  );
}

/** 글쓰기 화면 위에 보여주는 요약 */
export function BoardRulesSummary() {
  return (
    <aside className="mb-5 border border-lilac-200 bg-lilac-50 p-4 text-sm">
      <p className="font-bold">✋ 글을 쓰기 전에 꼭 확인해 주세요</p>
      <ul className="mt-1.5 grid list-inside list-disc gap-x-4 gap-y-0.5 text-ink-soft sm:grid-cols-2">
        {boardRules.map((rule) => (
          <li key={rule.title} className={rule.title.startsWith("다른 아이돌") ? "font-semibold text-ink" : ""}>
            {rule.title}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-soft">
        어기면 신고·운영자 확인 후 삭제되고, 반복되면 이용이 제한될 수 있어요.{" "}
        <Link href="/board/rules" className="font-semibold text-lilac-700 underline">
          규칙 자세히 보기
        </Link>
      </p>
    </aside>
  );
}
