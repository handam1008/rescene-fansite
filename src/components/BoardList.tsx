import Link from "next/link";
import { getMember } from "@/data/members";
import { POSTS_PER_PAGE, type BoardTab } from "@/lib/community";
import { formatBoardDate } from "@/lib/format";
import type { PostSummary } from "@/types";
import Nickname from "./Nickname";

const DAY = 24 * 60 * 60 * 1000;

function boardHref(basePath: string, tab: BoardTab, page = 1, q = "") {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function ImageIcon() {
  return (
    <svg aria-label="사진 있음" viewBox="0 0 16 16" className="inline-block h-3.5 w-3.5 shrink-0 text-lilac-500">
      <path
        fill="currentColor"
        d="M2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 1v6.3l3-3 3 3 2-2 4 4V4H2Zm9 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
      />
    </svg>
  );
}

/** [멤버] 말머리 + 제목 + 사진 아이콘 + 새 글 표시 + [댓글 수] */
function PostTitle({ post, now, showMember }: { post: PostSummary; now: number; showMember: boolean }) {
  const comments = post.comments[0]?.count ?? 0;
  const isNew = now - new Date(post.created_at).getTime() < DAY;
  const member = showMember ? getMember(post.member) : undefined;
  return (
    <span className="flex min-w-0 items-center gap-1">
      {post.hidden_at && <span className="shrink-0 bg-ink-soft px-1 text-[10px] leading-4 font-bold text-white">숨김</span>}
      {member && <span className="shrink-0 text-xs font-bold text-lilac-700">[{member.name}]</span>}
      <span className="truncate">{post.title}</span>
      {(post.image_paths?.length ?? 0) > 0 && <ImageIcon />}
      {isNew && (
        <span aria-label="새 글" className="shrink-0 bg-blush-400 px-1 text-[10px] leading-4 font-bold text-white">
          N
        </span>
      )}
      {comments > 0 && <span className="shrink-0 text-xs font-bold text-lilac-500">[{comments}]</span>}
    </span>
  );
}

function Pagination({ page, lastPage, href }: { page: number; lastPage: number; href: (page: number) => string }) {
  if (lastPage <= 1) return null;
  const start = Math.floor((page - 1) / 10) * 10 + 1;
  const end = Math.min(start + 9, lastPage);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const linkClass = "flex h-8 min-w-8 items-center justify-center px-1.5 hover:bg-lilac-100";

  return (
    <nav aria-label="페이지" className="mt-4 flex flex-wrap items-center justify-center gap-0.5 text-sm">
      {start > 1 && (
        <>
          <Link href={href(1)} className={linkClass} aria-label="처음">«</Link>
          <Link href={href(start - 1)} className={linkClass} aria-label="이전 10페이지">‹</Link>
        </>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={`${linkClass} border border-lilac-500 font-bold text-lilac-700`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={`${linkClass} text-ink-soft`}>
            {p}
          </Link>
        ),
      )}
      {end < lastPage && (
        <>
          <Link href={href(end + 1)} className={linkClass} aria-label="다음 10페이지">›</Link>
          <Link href={href(lastPage)} className={linkClass} aria-label="끝">»</Link>
        </>
      )}
    </nav>
  );
}

/**
 * 디시인사이드 스타일 게시판 목록.
 * PC: 번호 | 제목 | 글쓴이 | 작성일 | 조회 표 / 휴대폰: 제목 한 줄 + 정보 한 줄
 */
export default function BoardList({
  posts,
  total,
  page,
  tab,
  writeHref,
  basePath = "/board",
  showMember = true,
  currentPostId,
  q = "",
}: {
  posts: PostSummary[];
  total: number;
  page: number;
  tab: BoardTab;
  writeHref: string;
  /** 탭·페이지 링크의 기준 주소 (멤버 게시판이면 /members/woni/board) */
  basePath?: string;
  /** 제목 앞에 [멤버] 말머리 표시 (멤버 게시판에서는 끔) */
  showMember?: boolean;
  /** 글 보기 화면 아래 목록에서 지금 보는 글 강조 */
  currentPostId?: number;
  /** 검색어 (제목·내용) */
  q?: string;
}) {
  const now = Date.now();
  const lastPage = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const tabs: { key: BoardTab; label: string }[] = [
    { key: "all", label: "전체글" },
    { key: "best", label: "인기글" },
  ];
  const rowClass = (id: number) => (id === currentPostId ? "bg-lilac-100 font-semibold" : "hover:bg-lilac-50");

  return (
    <div>
      <div className="flex items-end justify-between border-b-2 border-lilac-500">
        <div className="flex">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={boardHref(basePath, t.key, 1, q)}
              aria-current={t.key === tab ? "page" : undefined}
              className={`px-4 py-2 text-sm font-bold ${
                t.key === tab ? "bg-lilac-500 text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="mb-1.5 flex items-center gap-3">
          <Link href="/board/rules" className="text-xs text-ink-soft underline hover:text-ink">
            게시판 규칙
          </Link>
          <Link
            href={writeHref}
            className="btn border border-lilac-500 bg-lilac-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-lilac-700"
          >
            글쓰기
          </Link>
        </div>
      </div>

      {q && (
        <p className="flex items-center justify-between border-b border-lilac-200 bg-lilac-50 px-3 py-2 text-sm">
          <span>
            <b>‘{q}’</b> 검색 결과 <b className="text-lilac-700">{total}</b>개
          </span>
          <Link href={boardHref(basePath, tab)} className="text-xs text-ink-soft underline hover:text-ink">
            검색 취소
          </Link>
        </p>
      )}

      {posts.length === 0 ? (
        <p className="border-b border-lilac-200 bg-white py-16 text-center text-sm text-ink-soft">
          {q ? "검색 결과가 없어요." : "아직 글이 없어요. 첫 글을 남겨주세요!"}
        </p>
      ) : (
        <>
          {/* PC: 표 */}
          <table className="hidden w-full table-fixed border-b border-lilac-200 bg-white text-sm sm:table">
            <thead className="border-b border-lilac-200 bg-lilac-50 text-xs text-ink-soft">
              <tr>
                <th scope="col" className="w-16 py-2 font-medium">번호</th>
                <th scope="col" className="py-2 font-medium">제목</th>
                <th scope="col" className="w-40 py-2 font-medium">글쓴이</th>
                <th scope="col" className="w-20 py-2 font-medium">작성일</th>
                <th scope="col" className="w-16 py-2 font-medium">조회</th>
                <th scope="col" className="w-14 py-2 font-medium">추천</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className={`border-b border-lilac-100 last:border-0 ${rowClass(post.id)}`}>
                  <td className="py-2 text-center text-xs text-ink-soft tabular-nums">{post.id}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/board/${post.id}`} className="block hover:underline">
                      <PostTitle post={post} now={now} showMember={showMember} />
                    </Link>
                  </td>
                  <td className="py-2 text-center">
                    <Nickname author={post.profiles} className="max-w-full justify-center" />
                  </td>
                  <td className="py-2 text-center text-xs text-ink-soft tabular-nums">{formatBoardDate(post.created_at)}</td>
                  <td className="py-2 text-center text-xs text-ink-soft tabular-nums">{post.view_count ?? 0}</td>
                  <td className="py-2 text-center text-xs text-ink-soft tabular-nums">{post.like_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 휴대폰: 두 줄 목록 */}
          <ul className="border-b border-lilac-200 bg-white sm:hidden">
            {posts.map((post) => (
              <li key={post.id} className={`border-b border-lilac-100 last:border-0 ${rowClass(post.id)}`}>
                <Link href={`/board/${post.id}`} className="block px-3 py-2.5">
                  <span className="text-[15px]">
                    <PostTitle post={post} now={now} showMember={showMember} />
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                    <Nickname author={post.profiles} />
                    <span className="shrink-0">{formatBoardDate(post.created_at)}</span>
                    <span className="shrink-0">조회 {post.view_count ?? 0}</span>
                    {(post.like_count ?? 0) > 0 && <span className="shrink-0">추천 {post.like_count}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination page={page} lastPage={lastPage} href={(p) => boardHref(basePath, tab, p, q)} />

      {/* 검색 (제목·내용). 글 보기 화면 아래 목록에서는 숨김 */}
      {currentPostId === undefined && (
        <form action={basePath} className="mx-auto mt-4 flex max-w-md gap-1.5" role="search">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <input
            name="q"
            defaultValue={q}
            maxLength={50}
            placeholder="제목·내용 검색"
            aria-label="게시판 검색"
            className="min-w-0 flex-1 border border-lilac-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-lilac-500"
          />
          <button type="submit" className="shrink-0 border border-lilac-500 bg-lilac-500 px-4 py-1.5 text-sm font-bold text-white">
            검색
          </button>
        </form>
      )}
    </div>
  );
}
