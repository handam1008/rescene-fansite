import Link from "next/link";
import { getI18n } from "@/i18n/server";

export default async function Footer() {
  const { m } = await getI18n();
  return (
    <footer className="mt-16 border-t border-lilac-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs leading-relaxed text-ink-soft">
        <p className="font-medium">{m.footer.unofficial}</p>
        <p className="mt-1">{m.footer.media}</p>
        <p className="mt-1">{m.footer.photos}</p>
        <p className="mt-2 space-x-3">
          <Link href="/privacy" className="font-semibold text-ink underline">
            {m.footer.privacy}
          </Link>
          <Link href="/board/rules" className="underline">
            {m.footer.rules}
          </Link>
          <Link href="/contact" className="underline">
            {m.footer.contact}
          </Link>
        </p>
      </div>
    </footer>
  );
}
