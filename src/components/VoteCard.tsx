import type { VoteWithStatus } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { localizeVote } from "@/lib/localize";
import type { VoteStatus } from "@/types";
import { ExternalButton, SampleBadge } from "./ui";

const statusStyle: Record<VoteStatus, string> = {
  ongoing: "bg-mint-dream-200 text-emerald-700",
  upcoming: "bg-sky-dream-200 text-sky-700",
  ended: "bg-gray-200 text-gray-500",
};

export async function VoteStatusBadge({ status }: { status: VoteStatus }) {
  const { m } = await getI18n();
  return <span className={`px-2.5 py-0.5 text-xs font-bold ${statusStyle[status]}`}>{m.vote[status]}</span>;
}

export default async function VoteCard({ vote: raw }: { vote: VoteWithStatus }) {
  const { m, locale } = await getI18n();
  const vote = localizeVote(raw, locale);
  const ended = vote.status === "ended";

  return (
    <article className={`card p-5 sm:p-6 ${ended ? "opacity-60 grayscale-[40%]" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <VoteStatusBadge status={vote.status} />
        <SampleBadge show={vote.isSample} />
      </div>
      <h2 className="mt-2 text-lg font-bold">{vote.awardName}</h2>
      {vote.category && <p className="text-sm text-ink-soft">{vote.category}</p>}

      <p className="mt-3 bg-lilac-50 px-3 py-2 text-sm">
        <span className="font-semibold">{m.vote.period} </span>
        {formatDateTime(vote.startDate, locale)} ~ {formatDateTime(vote.endDate, locale)}
      </p>

      {vote.steps.length > 0 && (
        <ol className="mt-4 space-y-2">
          {vote.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-lilac-200 text-xs font-bold text-lilac-700">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {vote.note && <p className="mt-3 text-xs text-ink-soft">※ {vote.note}</p>}

      {!ended && vote.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {vote.links.map((link) => (
            <ExternalButton key={link.url + link.label} href={link.url} variant="solid">
              {link.label}
            </ExternalButton>
          ))}
        </div>
      )}
    </article>
  );
}
