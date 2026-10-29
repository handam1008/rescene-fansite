import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CardImage from "@/components/CardImage";
import CatalogForm from "@/components/CatalogForm";
import CatalogImageButton from "@/components/CatalogImageButton";
import { EmptyState, PageHeader, SupabaseNotice, inputClass } from "@/components/ui";
import { pokedexMemberName } from "@/data/members";
import { cardSourceUrl } from "@/data/pokedex-sets";
import Link from "next/link";
import Nickname from "@/components/Nickname";
import { hiddenReasons, reportReasons } from "@/data/moderation";
import {
  getAdminSummary,
  getCatalog,
  getMembersForAdmin,
  getModerationQueue,
  getMostDislikedPosts,
  getPendingProofs,
  proofImageUrls,
} from "@/lib/community";
import type { Author, CatalogCard, ReportReason } from "@/types";
import { formatFullDateTime } from "@/lib/format";
import { inquiryStatus, type Inquiry } from "@/lib/inquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  addLiveLink,
  adminDeletePost,
  approveProof,
  banMember,
  clearReports,
  closeInquiry,
  deleteCatalogCard,
  deleteInquiry,
  deleteLiveLink,
  endLiveLink,
  hidePost,
  rejectProof,
  replyInquiry,
  restorePost,
  setAdmin,
  unbanMember,
  updateSetSourceUrl,
} from "./actions";

export const metadata: Metadata = { title: "운영자", robots: { index: false } };

export const dynamic = "force-dynamic";

function groupBySet(cards: CatalogCard[]) {
  const sets = new Map<string, CatalogCard[]>();
  for (const c of cards) {
    const key = `${c.source ?? "앨범"} · ${c.album}`;
    sets.set(key, [...(sets.get(key) ?? []), c]);
  }
  return sets;
}

/** 지금까지 나온 앨범 (도감 등록할 때 고르기 쉽게) */
const KNOWN_ALBUMS = ["Re:Scene", "Dearest", "SCENEDROME", "Glow Up", "lip bomb", "PULSE", "CU 리센느빵 2탄"];

const TABS = [
  { key: "summary", label: "요약" },
  { key: "board", label: "게시판" },
  { key: "members", label: "회원" },
  { key: "pokedex", label: "포카 도감" },
  { key: "live", label: "라이브" },
  { key: "inquiries", label: "문의" },
] as const;
type AdminTab = (typeof TABS)[number]["key"];

const sectionTitle = "mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  if (!isSupabaseConfigured) return <SupabaseNotice />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) {
    return <EmptyState>운영자만 들어올 수 있는 페이지예요.</EmptyState>;
  }

  const { tab: rawTab, q } = await searchParams;
  const tab: AdminTab = TABS.find((t) => t.key === rawTab)?.key ?? "summary";

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="운영자" description="운영자만 볼 수 있는 화면이에요. 게시판·회원·포카 도감·라이브·문의를 관리해요." />

      <nav aria-label="운영자 메뉴" className="flex border-b-2 border-lilac-500">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "summary" ? "/admin" : `/admin?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`px-4 py-2 text-sm font-bold ${tab === t.key ? "bg-lilac-500 text-white" : "text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "summary" && <SummarySection />}
      {tab === "board" && <BoardSection />}
      {tab === "members" && <MembersSection q={q ?? ""} myId={user.id} />}
      {tab === "pokedex" && <PokedexSection />}
      {tab === "live" && <LiveSection />}
      {tab === "inquiries" && <InquiriesSection />}
    </div>
  );
}

/* ───────── 요약 ───────── */

async function SummarySection() {
  const s = await getAdminSummary();
  const tiles: { label: string; value: number; href?: string; alert?: boolean }[] = [
    { label: "회원", value: s.members, href: "/admin?tab=members" },
    { label: "오늘 새 회원", value: s.newMembersToday, href: "/admin?tab=members" },
    { label: "전체 글", value: s.posts, href: "/board" },
    { label: "오늘 새 글", value: s.postsToday, href: "/board" },
    { label: "신고 들어온 글", value: s.reportedPosts, href: "/admin?tab=board", alert: s.reportedPosts > 0 },
    { label: "숨김 글", value: s.hiddenPosts, href: "/admin?tab=board", alert: s.hiddenPosts > 0 },
    { label: "포카 인증 대기", value: s.pendingProofs, href: "/admin?tab=pokedex", alert: s.pendingProofs > 0 },
    { label: "답변 안 한 문의", value: s.openInquiries, href: "/admin?tab=inquiries", alert: s.openInquiries > 0 },
    { label: "이용 제한 중", value: s.bannedMembers, href: "/admin?tab=members" },
    { label: "도감 채운 카드", value: s.filledCards, href: "/photocards" },
  ];
  return (
    <section>
      <h2 className={sectionTitle}>한눈에 보기</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href ?? "/admin"} className={`card btn block p-4 ${t.alert ? "border-blush-400 bg-blush-100" : ""}`}>
              <p className="text-xs text-ink-soft">{t.label}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{t.value}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────── 게시판: 신고·숨김 글, 비추천 많은 글 ───────── */

async function BoardSection() {
  const [moderation, disliked] = await Promise.all([getModerationQueue(), getMostDislikedPosts(20)]);
  return (
    <div className="space-y-10">
      {/* 게시판: 신고·숨김 글 */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">
          신고·숨김 글 <span className="text-lilac-500">{moderation.length}</span>건
        </h2>
        {moderation.length === 0 ? (
          <EmptyState>신고되거나 숨겨진 글이 없어요.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {moderation.map((post) => {
              const reasons = new Map<string, number>();
              for (const r of post.post_reports) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
              const details = post.post_reports.map((r) => r.detail).filter(Boolean);
              return (
                <li key={post.id} className="card p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.hidden_at ? (
                      <span className="bg-ink-soft px-1.5 text-xs font-bold text-white">
                        숨김 · {hiddenReasons[post.hidden_reason ?? "admin"]}
                      </span>
                    ) : post.restored_at ? (
                      <span className="border border-lilac-500 px-1.5 text-xs font-bold text-lilac-700">복구됨</span>
                    ) : (
                      <span className="border border-blush-400 px-1.5 text-xs font-bold">공개 중</span>
                    )}
                    <Link href={`/board/${post.id}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">
                      {post.title}
                    </Link>
                    <Nickname author={post.profiles} className="text-xs text-ink-soft" />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    신고 {post.report_count ?? 0} · 추천 {post.like_count ?? 0} · 비추천 {post.dislike_count ?? 0}
                    {reasons.size > 0 &&
                      ` · ${[...reasons].map(([r, n]) => `${reportReasons[r as ReportReason] ?? r} ${n}`).join(", ")}`}
                  </p>
                  {details.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-xs text-ink-soft">
                      {details.slice(0, 5).map((d, i) => (
                        <li key={i} className="truncate">
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <form action={post.hidden_at ? restorePost : hidePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="border border-lilac-200 bg-white px-3 py-1 hover:bg-lilac-50">
                        {post.hidden_at ? "복구 (다시 보이게)" : "숨기기"}
                      </button>
                    </form>
                    {(post.report_count ?? 0) > 0 && (
                      <form action={clearReports}>
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="border border-lilac-200 bg-white px-3 py-1 hover:bg-lilac-50">
                          신고 기록 지우기
                        </button>
                      </form>
                    )}
                    <form action={adminDeletePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="border border-ink bg-ink px-3 py-1 font-bold text-white">
                        완전히 삭제
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className={sectionTitle}>
          비추천 많은 글 <span className="text-xs font-normal text-ink-soft">비추천 순 · 최대 20개</span>
        </h2>
        {disliked.length === 0 ? (
          <EmptyState>비추천을 받은 글이 없어요.</EmptyState>
        ) : (
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="bg-lilac-50 text-xs text-ink-soft">
              <tr>
                <th className="py-2 text-left font-medium">제목</th>
                <th className="w-32 py-2 font-medium">글쓴이</th>
                <th className="w-14 py-2 font-medium">비추</th>
                <th className="w-14 py-2 font-medium">추천</th>
                <th className="w-28 py-2 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {disliked.map((post) => (
                <tr key={post.id} className="border-t border-lilac-100">
                  <td className="max-w-0 truncate py-2 pr-2">
                    {post.hidden_at && <span className="mr-1 bg-ink-soft px-1 text-[10px] font-bold text-white">숨김</span>}
                    <Link href={`/board/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-2 text-center">
                    <Nickname author={post.profiles} className="max-w-full justify-center text-xs" />
                  </td>
                  <td className="py-2 text-center font-bold text-red-600 tabular-nums">{post.dislike_count ?? 0}</td>
                  <td className="py-2 text-center tabular-nums">{post.like_count ?? 0}</td>
                  <td className="py-2 text-center">
                    <form action={post.hidden_at ? restorePost : hidePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="border border-lilac-200 bg-white px-2 py-0.5 text-xs hover:bg-lilac-50">
                        {post.hidden_at ? "복구" : "숨기기"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

/* ───────── 회원: 검색, 이용 제한, 운영자 지정 ───────── */

async function MembersSection({ q, myId }: { q: string; myId: string }) {
  const members = await getMembersForAdmin(q);
  return (
    <section className="space-y-4">
      <h2 className={sectionTitle}>회원 관리</h2>
      <form action="/admin" className="flex max-w-md gap-1.5" role="search">
        <input type="hidden" name="tab" value="members" />
        <input
          name="q"
          defaultValue={q}
          placeholder="닉네임 검색"
          aria-label="닉네임 검색"
          className="min-w-0 flex-1 border border-lilac-200 bg-white px-3 py-1.5 text-sm"
        />
        <button type="submit" className="border border-lilac-500 bg-lilac-500 px-4 py-1.5 text-sm font-bold text-white">
          검색
        </button>
      </form>
      <p className="text-xs text-ink-soft">
        최근 가입 순 50명{q && ` · ‘${q}’ 검색 결과`}. 운영자로 지정하면 이 화면과 숨기기·삭제·이용 제한을 모두 쓸 수 있어요.
      </p>
      {members.length === 0 ? (
        <EmptyState>회원이 없어요.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => {
            const banned = m.banned_until && new Date(m.banned_until) > new Date();
            return (
              <li key={m.id} className={`card p-4 text-sm ${banned ? "border-blush-400" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Nickname author={m} className="font-semibold" />
                  {m.id === myId && <span className="text-xs text-ink-soft">(나)</span>}
                  <span className="text-xs text-ink-soft">
                    가입 {formatFullDateTime(m.created_at).slice(0, 13)} · 글 {m.posts[0]?.count ?? 0} · 댓글 {m.comments[0]?.count ?? 0}
                  </span>
                  {banned && (
                    <span className="bg-blush-400 px-1.5 text-xs font-bold text-white">
                      이용 제한 ~{new Date(m.banned_until!).getFullYear() >= 2999 ? "영구" : formatFullDateTime(m.banned_until!).slice(0, 13)}
                    </span>
                  )}
                </div>
                {banned && m.ban_reason && <p className="mt-1 text-xs text-ink-soft">사유: {m.ban_reason}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {m.id !== myId && (
                    <form action={setAdmin}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="make" value={m.is_admin ? "0" : "1"} />
                      <button
                        type="submit"
                        className={`border px-2.5 py-1 font-semibold ${m.is_admin ? "border-lilac-200 bg-white" : "border-ink bg-ink text-white"}`}
                      >
                        {m.is_admin ? "운영자 해제" : "🛠 운영자로 지정"}
                      </button>
                    </form>
                  )}
                  {!m.is_admin &&
                    (banned ? (
                      <form action={unbanMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className="border border-lilac-200 bg-white px-2.5 py-1">
                          이용 제한 풀기
                        </button>
                      </form>
                    ) : (
                      <form action={banMember} className="flex flex-wrap items-center gap-1.5">
                        <input type="hidden" name="id" value={m.id} />
                        <select name="days" defaultValue="7" aria-label="제한 기간" className="border border-lilac-200 bg-white px-1.5 py-1">
                          <option value="1">1일</option>
                          <option value="7">7일</option>
                          <option value="30">30일</option>
                          <option value="forever">영구</option>
                        </select>
                        <input
                          name="reason"
                          maxLength={200}
                          placeholder="사유 (회원에게 보여요)"
                          aria-label="제한 사유"
                          className="w-48 border border-lilac-200 bg-white px-2 py-1"
                        />
                        <button type="submit" className="border border-blush-400 bg-blush-100 px-2.5 py-1 font-semibold">
                          이용 제한
                        </button>
                      </form>
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ───────── 포카 도감: 인증 확인, 카드 등록, 등록된 카드 ───────── */

async function PokedexSection() {
  const [pending, catalog] = await Promise.all([getPendingProofs(), getCatalog()]);
  const proofUrls = await proofImageUrls(pending.map((p) => p.photo_path));
  const albums = [...new Set([...KNOWN_ALBUMS, ...catalog.map((c) => c.album)])];

  return (
    <div className="space-y-10">
      {/* 인증 확인 */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">
          인증 대기 <span className="text-lilac-500">{pending.length}</span>건
        </h2>
        {pending.length === 0 ? (
          <EmptyState>확인할 인증이 없어요.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex gap-3">
                  <figure className="w-28 shrink-0">
                    {p.photocard_catalog && <CardImage card={p.photocard_catalog} />}
                    <figcaption className="mt-1 text-center text-[11px] text-ink-soft">도감 카드</figcaption>
                  </figure>
                  <figure className="w-40 shrink-0">
                    {proofUrls.get(p.photo_path) ? (
                      <a href={proofUrls.get(p.photo_path)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- 비공개 인증 사진(임시 주소) */}
                        <img src={proofUrls.get(p.photo_path)} alt="회원 인증 사진" className="max-h-60 w-full border border-lilac-200 object-contain" />
                      </a>
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-lilac-50 text-xs text-ink-soft">사진을 불러오지 못했어요</div>
                    )}
                    <figcaption className="mt-1 text-center text-[11px] text-ink-soft">회원이 찍은 사진 (누르면 크게)</figcaption>
                  </figure>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
                  <p>
                    <b>{p.profiles?.nickname ?? "알 수 없음"}</b>
                    <span className="ml-2 text-xs text-ink-soft">{formatFullDateTime(p.created_at)}</span>
                  </p>
                  {p.photocard_catalog && (
                    <p className="text-ink-soft">
                      {p.photocard_catalog.album} · {pokedexMemberName(p.photocard_catalog.member)}
                      {p.photocard_catalog.label && ` · ${p.photocard_catalog.label}`}
                    </p>
                  )}
                  <p className="text-xs">
                    {p.share_image ? (
                      <span className="font-semibold text-lilac-700">✓ 도감 이미지 공개 동의</span>
                    ) : (
                      <span className="text-ink-soft">공개 동의 안 함 (수집 인증만)</span>
                    )}
                  </p>
                  <div className="mt-auto flex flex-wrap items-end gap-2">
                    <form action={approveProof}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="border border-lilac-500 bg-lilac-500 px-4 py-1.5 font-bold text-white hover:bg-lilac-700">
                        {p.share_image && !p.photocard_catalog?.image_path ? "승인 + 도감 채우기" : "승인"}
                      </button>
                    </form>
                    {p.share_image && (
                      <form action={approveProof}>
                        <input type="hidden" name="id" value={p.id} />
                        {p.photocard_catalog?.image_path ? (
                          <input type="hidden" name="useAsImage" value="1" />
                        ) : (
                          <input type="hidden" name="skipImage" value="1" />
                        )}
                        <button type="submit" className="border border-lilac-200 bg-white px-3 py-1.5 font-bold text-ink-soft hover:bg-lilac-50">
                          {p.photocard_catalog?.image_path ? "승인 + 도감 이미지 교체" : "승인만 (사진은 도감에 안 씀)"}
                        </button>
                      </form>
                    )}
                    <form action={rejectProof} className="flex flex-1 gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="reason"
                        maxLength={200}
                        placeholder="반려 사유 (비우면 기본 문구)"
                        className="min-w-0 flex-1 border border-lilac-200 px-2 py-1.5 text-sm"
                      />
                      <button type="submit" className="border border-lilac-200 bg-white px-3 py-1.5 hover:bg-lilac-50">
                        반려
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 도감 카드 등록 */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">도감에 카드 등록</h2>
        <div className="card p-5">
          <CatalogForm albums={albums} />
        </div>
      </section>

      {/* 등록된 카드 (세트별) */}
      <section>
        <h2 className="mb-3 border-b-2 border-lilac-500 pb-1.5 font-bold">
          등록된 카드 <span className="text-lilac-500">{catalog.length}</span>장
          <span className="ml-2 text-xs font-normal text-ink-soft">
            이미지 없는 카드 {catalog.filter((c) => !c.image_path).length}장
          </span>
        </h2>
        {catalog.length === 0 ? (
          <EmptyState>아직 등록된 카드가 없어요.</EmptyState>
        ) : (
          <div className="space-y-2">
            {[...groupBySet(catalog).entries()].map(([set, cards]) => (
              <details key={set} className="card">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                  {set} <span className="font-normal text-ink-soft">· {cards.length}장 (이미지 없음 {cards.filter((c) => !c.image_path).length})</span>
                </summary>
                <form action={updateSetSourceUrl} className="flex gap-2 border-t border-lilac-100 px-4 pt-3 text-xs">
                  <input type="hidden" name="source" value={cards[0].source ?? "앨범"} />
                  <input type="hidden" name="album" value={cards[0].album} />
                  <input
                    name="url"
                    type="url"
                    maxLength={500}
                    defaultValue={cardSourceUrl(cards[0]) ?? ""}
                    placeholder="공식 공지·기사 링크 (https://…)"
                    aria-label="세트 출처 링크"
                    className="min-w-0 flex-1 border border-lilac-200 px-2 py-1.5"
                  />
                  <button type="submit" className="shrink-0 border border-lilac-200 bg-white px-3 py-1.5 hover:bg-lilac-50">
                    출처 링크 저장
                  </button>
                </form>
                <ul className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
                  {cards.map((c) => (
                    <li key={c.id} className="text-xs">
                      <CardImage card={c} />
                      <p className="mt-1 truncate font-semibold">{pokedexMemberName(c.member)}</p>
                      {c.label && <p className="truncate text-ink-soft">{c.label}</p>}
                      <div className="mt-0.5 flex gap-2">
                        <CatalogImageButton cardId={c.id} current={c.image_path} />
                        <form action={deleteCatalogCard}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-ink-soft underline hover:text-ink">
                            삭제
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ───────── 라이브 ───────── */

type LiveLinkRow = { id: number; title: string; url: string; starts_at: string; ends_at: string };

/** 입력칸 기본값: 지금 한국 시간 "2026-10-28T15:40" */
function kstInputNow() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).slice(0, 16).replace(" ", "T");
}

async function LiveSection() {
  const supabase = await createClient();
  // 끝난 지 7일 안 된 것까지 보여줌
  const { data } = await supabase
    .from("live_links")
    .select("id, title, url, starts_at, ends_at")
    .gt("ends_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
    .order("starts_at", { ascending: false })
    .limit(30);
  const rows = (data ?? []) as LiveLinkRow[];
  const now = Date.now();
  const status = (r: LiveLinkRow) =>
    Date.parse(r.ends_at) <= now ? "끝남" : Date.parse(r.starts_at) <= now ? "방송 중" : "예정";

  return (
    <div className="space-y-8">
      <section>
        <h2 className={sectionTitle}>라이브 링크 추가</h2>
        <p className="mb-3 text-sm text-ink-soft">
          넣은 시간 동안 사이트 위쪽에 빨간 LIVE 줄이 뜨고 /live 에서 바로 볼 수 있어요. 시작 30분 전부터는 &quot;곧 LIVE&quot;로
          보여요. 유튜브 주소면 사이트 안에서 바로 재생돼요 (방송사가 퍼가기를 막은 영상은 유튜브로 안내).
        </p>
        <form action={addLiveLink} className="card grid gap-3 p-4 text-sm sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="font-semibold">제목</span>
            <input name="title" required maxLength={80} placeholder="예: 쇼! 음악중심 리센느 컴백 무대" className={`${inputClass} mt-1`} />
          </label>
          <label className="sm:col-span-2">
            <span className="font-semibold">라이브 주소</span>
            <input
              name="url"
              type="url"
              required
              pattern="https://.*"
              placeholder="https://www.youtube.com/watch?v=..."
              className={`${inputClass} mt-1`}
            />
          </label>
          <label>
            <span className="font-semibold">시작 (한국 시간)</span>
            <input name="startsAt" type="datetime-local" required defaultValue={kstInputNow()} className={`${inputClass} mt-1`} />
          </label>
          <label>
            <span className="font-semibold">길이</span>
            <select name="hours" defaultValue="2" className={`${inputClass} mt-1`}>
              {[1, 2, 3, 4, 6].map((h) => (
                <option key={h} value={h}>
                  {h}시간
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="border border-red-500 bg-red-500 px-4 py-2 font-bold text-white sm:col-span-2">
            LIVE 추가
          </button>
        </form>
      </section>

      <section>
        <h2 className={sectionTitle}>라이브 목록</h2>
        {rows.length === 0 ? (
          <EmptyState>아직 넣은 라이브가 없어요.</EmptyState>
        ) : (
          <ul className="card divide-y divide-lilac-100 text-sm">
            {rows.map((r) => {
              const st = status(r);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
                  <span
                    className={`px-1.5 py-0.5 text-xs font-bold ${
                      st === "방송 중" ? "bg-red-500 text-white" : st === "예정" ? "bg-lilac-100 text-lilac-700" : "bg-ink/10 text-ink-soft"
                    }`}
                  >
                    {st}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{r.title}</span>
                    <span className="block text-xs text-ink-soft tabular-nums">
                      {formatFullDateTime(r.starts_at)} ~ {formatFullDateTime(r.ends_at).slice(-5)} ·{" "}
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
                        주소 열기
                      </a>
                    </span>
                  </span>
                  {st !== "끝남" && (
                    <form action={endLiveLink}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="border border-lilac-300 bg-white px-2.5 py-1">
                        {st === "예정" ? "취소" : "지금 끝내기"}
                      </button>
                    </form>
                  )}
                  <form action={deleteLiveLink}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="border border-lilac-200 bg-white px-2.5 py-1 text-ink-soft">
                      삭제
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ───────── 문의 ───────── */

const inquiryCategoryLabels: Record<Inquiry["category"], string> = {
  suggestion: "건의·제안",
  report: "신고",
  bug: "오류 제보",
  other: "기타",
};

type AdminInquiry = Inquiry & { profiles: Author };

async function InquiriesSection() {
  const supabase = await createClient();
  // 답변 안 한 문의는 전부, 처리한 문의는 최근 30개
  const [{ data: open }, { data: done }] = await Promise.all([
    supabase
      .from("inquiries")
      .select("*, profiles(*)")
      .is("replied_at", null)
      .is("closed_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("inquiries")
      .select("*, profiles(*)")
      .or("replied_at.not.is.null,closed_at.not.is.null")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const openRows = (open ?? []) as unknown as AdminInquiry[];
  const doneRows = (done ?? []) as unknown as AdminInquiry[];

  return (
    <div className="space-y-8">
      <section>
        <h2 className={sectionTitle}>
          답변 안 한 문의 <span className="text-lilac-500">{openRows.length}</span>건
        </h2>
        <p className="mb-3 text-sm text-ink-soft">
          오래된 문의가 위에 있어요. 답변을 보내면 회원에게 알림이 가고, 회원은 문의 화면에서 답변을 봐요.
        </p>
        {openRows.length === 0 ? (
          <EmptyState>답변할 문의가 없어요. 👍</EmptyState>
        ) : (
          <ul className="space-y-3">
            {openRows.map((q) => (
              <InquiryItem key={q.id} q={q} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className={sectionTitle}>처리한 문의 (최근 30개)</h2>
        {doneRows.length === 0 ? (
          <EmptyState>아직 처리한 문의가 없어요.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {doneRows.map((q) => (
              <InquiryItem key={q.id} q={q} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InquiryItem({ q }: { q: AdminInquiry }) {
  const status = inquiryStatus(q);
  return (
    <li className={`card p-4 text-sm ${status === "open" ? "border-lilac-500" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className={`px-1.5 py-0.5 font-bold ${q.category === "report" ? "bg-blush-400 text-white" : "bg-lilac-100 text-lilac-700"}`}>
          {inquiryCategoryLabels[q.category] ?? q.category}
        </span>
        <Nickname author={q.profiles} className="font-semibold" />
        <span className="text-ink-soft tabular-nums">{formatFullDateTime(q.created_at)}</span>
        {status === "answered" && <span className="font-bold text-lilac-700">답변 완료</span>}
        {status === "closed" && <span className="font-bold text-ink-soft">답변 없이 처리</span>}
      </div>
      <p className="mt-2 break-words whitespace-pre-wrap">{q.content}</p>

      <form action={replyInquiry} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={q.id} />
        <textarea
          name="reply"
          required
          maxLength={2000}
          rows={3}
          defaultValue={q.reply ?? ""}
          placeholder="답변을 적어주세요. 회원에게 그대로 보여요."
          className={`${inputClass} leading-relaxed`}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <button type="submit" className="border border-lilac-500 bg-lilac-500 px-3 py-1.5 font-bold text-white">
            {q.reply ? "답변 고치기" : "답변 보내기"}
          </button>
        </div>
      </form>
      <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs">
        {status !== "answered" && (
          <form action={closeInquiry}>
            <input type="hidden" name="id" value={q.id} />
            {status === "closed" && <input type="hidden" name="reopen" value="1" />}
            <button type="submit" className="border border-lilac-300 bg-white px-2.5 py-1">
              {status === "closed" ? "다시 열기" : "답변 없이 처리"}
            </button>
          </form>
        )}
        <form action={deleteInquiry}>
          <input type="hidden" name="id" value={q.id} />
          <button type="submit" className="border border-lilac-200 bg-white px-2.5 py-1 text-ink-soft">
            삭제
          </button>
        </form>
      </div>
    </li>
  );
}
