"use client";

import Link from "next/link";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { BellIcon, LoginIcon, LogoutIcon, MailIcon, PencilIcon, ShieldIcon, UserIcon } from "./Icons";

/**
 * 헤더 오른쪽의 로그인 상태.
 * 브라우저에서 확인하기 때문에 홈·컴백 같은 페이지는 정적으로 빠르게 유지됩니다.
 */
export default function AuthStatus() {
  const router = useRouter();
  const { m } = useI18n();
  // 서버에서 로그인한 뒤 페이지가 바뀌면 다시 확인
  const pathname = usePathname();
  const [nickname, setNickname] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);
  // 운영자: 답변 안 한 문의 수
  const [openInquiries, setOpenInquiries] = useState(0);
  // 운영자: 승인 기다리는 포카 인증 수
  const [pendingProofs, setPendingProofs] = useState(0);
  const [needsNickname, setNeedsNickname] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    async function load(userId: string | undefined) {
      if (!userId) {
        setIsAdmin(false);
        setUnread(0);
        setOpenInquiries(0);
        setPendingProofs(0);
        return setNickname(null);
      }
      const [{ data }, { count }] = await Promise.all([
        supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle(),
        // 안 읽은 댓글 알림 수 (0010 SQL 전이면 0)
        supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
      ]);
      // 닉네임이 비어 있으면 화면에서 기본 이름("리마인")으로 보여줌
      setNickname(data?.nickname ?? "");
      setNeedsNickname(data?.nickname_set === false);
      setIsAdmin(data?.is_admin === true);
      setUnread(count ?? 0);
      if (data?.is_admin === true) {
        // 답변 안 한 문의 (0015 SQL 전이면 0) + 승인 기다리는 포카 인증
        const [{ count: open }, { count: proofs }] = await Promise.all([
          supabase.from("inquiries").select("id", { count: "exact", head: true }).is("replied_at", null).is("closed_at", null),
          supabase.from("photocard_collections").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        setOpenInquiries(open ?? 0);
        setPendingProofs(proofs ?? 0);
      } else {
        setOpenInquiries(0);
        setPendingProofs(0);
      }
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  // 연결 전이거나 아직 확인 중이면 자리만 차지하지 않게 숨김
  if (!isSupabaseConfigured || nickname === undefined) return null;

  if (nickname === null) {
    return (
      <div className={rowClass}>
        <Action href="/board/new" icon={<PencilIcon />} label={m.auth.write} hideOnPhone />
        <Action href="/login" icon={<LoginIcon />} label={m.auth.login} />
        <Action href="/signup" icon={<UserIcon />} label={m.auth.signup} accent />
      </div>
    );
  }

  return (
    <div className={rowClass}>
      {/* 운영자는 운영자 화면, 그 외 회원은 같은 자리에 문의 */}
      {isAdmin ? (
        <Action
          href={openInquiries ? "/admin?tab=inquiries" : pendingProofs ? "/admin?tab=pokedex" : "/admin"}
          icon={<ShieldIcon />}
          label={m.auth.admin}
          badge={openInquiries + pendingProofs > 0 ? String(openInquiries + pendingProofs) : undefined}
          ariaLabel={
            openInquiries + pendingProofs ? fmt(m.auth.adminAria, { n: openInquiries, p: pendingProofs }) : undefined
          }
        />
      ) : (
        <Action href="/contact" icon={<MailIcon />} label={m.auth.contact} short={m.auth.contactShort} />
      )}
      <Action href="/board/new" icon={<PencilIcon />} label={m.auth.write} hideOnPhone />
      <Action
        href="/notifications"
        icon={<BellIcon />}
        label={m.auth.notifications}
        badge={unread > 0 ? (unread > 99 ? "99+" : String(unread)) : undefined}
        ariaLabel={unread ? fmt(m.auth.notificationsAria, { n: unread }) : m.auth.notifications}
      />
      {needsNickname ? (
        <Action href="/account?setup=1" icon={<UserIcon />} label={m.auth.setNickname} short={m.auth.setNicknameShort} accent />
      ) : (
        <Action href="/account" icon={<UserIcon />} label={nickname || m.auth.defaultNickname} short={m.auth.myPage} title={m.auth.myPage} />
      )}
      <Action
        icon={<LogoutIcon />}
        label={m.auth.logout}
        onClick={async () => {
          await createClient().auth.signOut();
          router.refresh();
        }}
      />
    </div>
  );
}

const rowClass = "flex shrink-0 items-center gap-0.5 xl:gap-1";

/**
 * 헤더 오른쪽 버튼 한 칸. 휴대폰은 아이콘 아래 작은 글자, PC 는 아이콘 옆 글자.
 * short: 휴대폰에서 대신 보여줄 짧은 글자 (긴 닉네임 등)
 * badge: 안 읽은 알림 수 (휴대폰은 아이콘 위, PC 는 글자 옆)
 */
function Action({
  href,
  onClick,
  icon,
  label,
  short,
  title,
  ariaLabel,
  badge,
  accent,
  hideOnPhone,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  short?: string;
  title?: string;
  ariaLabel?: string;
  badge?: string;
  accent?: boolean;
  /** 좁은 휴대폰에서는 숨김 (게시판 화면에 같은 버튼이 있음) */
  hideOnPhone?: boolean;
}) {
  const className = `btn ${hideOnPhone ? "hidden sm:flex" : "flex"} min-w-11 flex-col items-center gap-0.5 px-1.5 py-1 text-[11px] font-semibold whitespace-nowrap xl:min-w-0 xl:flex-row xl:gap-1.5 xl:px-3 xl:py-2 xl:text-[15px] ${
    accent ? "text-lilac-700 xl:bg-lilac-200 xl:text-ink xl:hover:bg-lilac-300" : "text-ink-soft hover:bg-lilac-50 hover:text-ink"
  }`;
  const badgeClass = "min-w-4 bg-blush-400 px-1 text-center text-[10px] leading-4 font-bold text-white";
  const body = (
    <>
      <span className="relative">
        {icon}
        {badge && <span className={`absolute -top-1 -right-2.5 xl:hidden ${badgeClass}`}>{badge}</span>}
      </span>
      {short ? (
        <>
          <span className="xl:hidden">{short}</span>
          <span className="hidden max-w-28 truncate xl:inline">{label}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
      {badge && <span className={`hidden xl:inline ${badgeClass}`}>{badge}</span>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className} title={title} aria-label={ariaLabel}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}
