import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { EmptyState, PageHeader, SupabaseNotice } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import { formatFullDateTime } from "@/lib/format";
import { inquiryStatus, type Inquiry, type InquiryStatus } from "@/lib/inquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.contact.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

const statusClass: Record<InquiryStatus, string> = {
  open: "bg-lilac-100 text-lilac-700",
  answered: "bg-lilac-500 text-white",
  closed: "bg-ink/10 text-ink-soft",
};

/** 운영자에게 문의: 보내기 + 내가 보낸 문의와 답변 */
export default async function ContactPage() {
  const { m } = await getI18n();
  const header = <PageHeader eyebrow="Contact" title={m.contact.title} description={m.contact.desc} />;
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <SupabaseNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <EmptyState>
          <Link href="/login?next=/contact" className="font-semibold text-lilac-700 underline">
            {m.contact.loginLink}
          </Link>
          {m.contact.loginAfter}
        </EmptyState>
      </div>
    );
  }

  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  const mine = (data ?? []) as Inquiry[];
  const statusLabel: Record<InquiryStatus, string> = {
    open: m.contact.statusOpen,
    answered: m.contact.statusAnswered,
    closed: m.contact.statusClosed,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        {header}
        <ContactForm />
      </div>

      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">{m.contact.mine}</h2>
        {mine.length === 0 ? (
          <EmptyState>{m.contact.empty}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {mine.map((q) => {
              const status = inquiryStatus(q);
              return (
                <li key={q.id} className="card p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 font-bold ${statusClass[status]}`}>{statusLabel[status]}</span>
                    <span className="font-semibold">{m.contact.categories[q.category]}</span>
                    <span className="text-ink-soft tabular-nums">{formatFullDateTime(q.created_at)}</span>
                  </div>
                  <p className="mt-2 break-words whitespace-pre-wrap">{q.content}</p>
                  {q.reply && (
                    <div className="mt-3 border-l-4 border-lilac-500 bg-lilac-50 px-3 py-2">
                      <p className="text-xs font-bold text-lilac-700">
                        {m.contact.reply}
                        {q.replied_at && <span className="ml-2 font-normal text-ink-soft tabular-nums">{formatFullDateTime(q.replied_at)}</span>}
                      </p>
                      <p className="mt-1 break-words whitespace-pre-wrap">{q.reply}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
