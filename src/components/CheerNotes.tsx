import { getMember, nameOf } from "@/data/members";
import { getI18n } from "@/i18n/server";
import { deleteCheer } from "@/app/cheer/actions";
import type { CheerMessage } from "@/lib/cheer";

/**
 * 롤링페이퍼 쪽지들. 받는 멤버 색깔의 쪽지에 살짝 기울여 붙인 모양.
 * canDelete: 이 쪽지를 뗄 수 있는지 (쓴 사람·페이지 주인·운영자)
 */
export default async function CheerNotes({
  messages,
  canDelete,
  showPaperLink = false,
}: {
  messages: CheerMessage[];
  canDelete?: (c: CheerMessage) => boolean;
  showPaperLink?: boolean;
}) {
  const { m, locale } = await getI18n();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {messages.map((c, i) => {
        const member = getMember(c.member);
        const tilt = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-2", "rotate-2"][i % 5];
        return (
          <li
            key={c.id}
            className={`relative flex min-h-32 flex-col p-3 text-sm shadow-sm ${tilt}`}
            style={{ backgroundColor: member?.color ?? "#e0d4ff" }}
          >
            <p className="text-[11px] font-bold text-ink/70">To. {member ? nameOf(member, locale) : m.cheer.toAll}</p>
            <p className="mt-1 flex-1 leading-snug font-semibold break-words whitespace-pre-wrap text-ink">{c.content}</p>
            <p className="mt-2 truncate text-right text-[11px] font-semibold text-ink/70">From. {c.author?.nickname ?? m.home.unknownUser}</p>
            {showPaperLink && (
              <a href={`/cheer/${c.paper_id}`} className="absolute inset-0" aria-label={m.cheer.title} />
            )}
            {canDelete?.(c) && (
              <form action={deleteCheer} className="absolute top-1 right-1">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="paperId" value={c.paper_id} />
                <button type="submit" className="bg-white/70 px-1.5 text-[11px] text-ink-soft hover:text-ink" aria-label={m.cheer.delete}>
                  ✕
                </button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
