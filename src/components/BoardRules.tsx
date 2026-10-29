import Link from "next/link";
import { RULES_UPDATED } from "@/data/board-rules";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

/** 게시판 규칙 전체 (/board/rules) */
export async function BoardRulesFull() {
  const { m } = await getI18n();
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {m.board.rulesList.map((rule, i) => (
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
        <h2 className="mb-1.5 font-bold">{m.board.ifBroken}</h2>
        <ul className="list-inside list-disc space-y-0.5 text-ink-soft">
          {m.board.sanctions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-soft">{fmt(m.board.asOf, { date: RULES_UPDATED })}</p>
      </section>
    </div>
  );
}

/** 글쓰기 화면 위에 보여주는 요약 (첫 규칙 "다른 아이돌 언급·비교 금지"는 굵게) */
export async function BoardRulesSummary() {
  const { m } = await getI18n();
  return (
    <aside className="mb-5 border border-lilac-200 bg-lilac-50 p-4 text-sm">
      <p className="font-bold">{m.board.checkFirst}</p>
      <ul className="mt-1.5 grid list-inside list-disc gap-x-4 gap-y-0.5 text-ink-soft sm:grid-cols-2">
        {m.board.rulesList.map((rule, i) => (
          <li key={rule.title} className={i === 0 ? "font-semibold text-ink" : ""}>
            {rule.title}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-soft">
        {m.board.summaryNote}{" "}
        <Link href="/board/rules" className="font-semibold text-lilac-700 underline">
          {m.board.rulesMore}
        </Link>
      </p>
    </aside>
  );
}
