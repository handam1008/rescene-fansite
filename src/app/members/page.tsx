import type { Metadata } from "next";
import Link from "next/link";
import { MemberAvatar } from "@/components/MemberHeader";
import { PageHeader } from "@/components/ui";
import { members } from "@/data/members";

export const metadata: Metadata = { title: "멤버" };

export default function MembersPage() {
  return (
    <>
      <PageHeader eyebrow="Members" title="멤버" description="멤버를 누르면 프로필·개인 일정·멤버 게시판을 볼 수 있어요." />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {members.map((m) => (
          <li key={m.slug}>
            <Link href={`/members/${m.slug}`} className="card flex flex-col items-center gap-3 p-5 text-center hover:border-lilac-500">
              <MemberAvatar member={m} size={88} />
              <div>
                <p className="text-lg font-extrabold">{m.name}</p>
                <p className="text-xs tracking-wider text-ink-soft uppercase">{m.english}</p>
              </div>
              {m.note && <span className="bg-lilac-100 px-2 py-0.5 text-xs font-semibold text-lilac-700">{m.note}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
