"use client";

import { useEffect, useMemo, useState } from "react";
import { members, nameOf, type MemberSlug } from "@/data/members";
import { useI18n } from "@/i18n/client";
import { nicknameFormatOk } from "@/lib/nickname";
import { cardQuery } from "@/lib/card-query";
import TodayActions from "./TodayActions";
import { inputClass } from "./ui";

/**
 * 나만의 리마인 카드 만들기. 고르는 대로 미리보기가 바뀌고, 저장·공유 버튼은 오늘의 리센느와 같음.
 * 로그인했으면 닉네임은 내 프로필 닉네임 (칭호·포카 기록과 맞게), 아니면 직접 입력
 */
export default function CardBuilder({ me }: { me: { id: string; nickname: string; favs: MemberSlug[] } | null }) {
  const { m, locale } = useI18n();
  const [name, setName] = useState("");
  const [favs, setFavs] = useState<MemberSlug[]>(me?.favs ?? []);
  const [stats, setStats] = useState(Boolean(me));
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const query = useMemo(
    () => cardQuery({ u: me?.id, s: stats, name: me ? undefined : nicknameFormatOk(name.trim()) ? name.trim() : undefined, fav: favs }),
    [me, stats, name, favs],
  );
  // 글자를 칠 때마다 이미지를 새로 만들지 않게 잠깐 기다렸다가 미리보기 바꿈
  const [preview, setPreview] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setPreview(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const imageUrl = `/card/image?${preview}${preview ? "&" : ""}lang=${locale}`;
  const shareUrl = `${origin}/card${query ? `?${query}` : ""}`;
  const toggle = (slug: MemberSlug) =>
    setFavs((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : members.map((x) => x.slug).filter((s) => s === slug || cur.includes(s))));

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-5">
        {me ? (
          <p className="text-sm">
            <span className="font-semibold">{m.card.nickname}</span> · {me.nickname}
          </p>
        ) : (
          <label className="block space-y-1">
            <span className="text-sm font-semibold">{m.card.nickname}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder={m.card.nicknamePlaceholder}
              className={inputClass}
            />
            <span className={`block text-xs ${name && !nicknameFormatOk(name.trim()) ? "text-red-600" : "text-ink-soft"}`}>{m.card.nicknameHint}</span>
          </label>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{m.card.fav}</legend>
          <div className="flex flex-wrap gap-2">
            {members.map((x) => {
              const on = favs.includes(x.slug);
              return (
                <button
                  key={x.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(x.slug)}
                  className={`border-2 px-3 py-1.5 text-sm font-bold ${on ? "text-ink" : "border-lilac-200 bg-white text-ink-soft"}`}
                  style={on ? { backgroundColor: x.color, borderColor: x.color } : undefined}
                >
                  {on ? "💜 " : ""}
                  {nameOf(x, locale)}
                </button>
              );
            })}
          </div>
        </fieldset>

        {me ? (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={stats} onChange={(e) => setStats(e.target.checked)} className="mt-1" />
            <span>
              <span className="font-semibold">{m.card.stats}</span>
              <span className="block text-xs text-ink-soft">{m.card.statsHint}</span>
            </span>
          </label>
        ) : (
          <p className="text-xs text-ink-soft">{m.card.loginForStats}</p>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- 직접 만든 카드 이미지 */}
      <img src={imageUrl} alt={m.card.title} width={1080} height={1350} className="h-auto w-full border border-lilac-200 bg-white" />
      <TodayActions
        imageUrl={imageUrl}
        fileName="remine-card.png"
        postText={`${m.card.shareText}\n${shareUrl}\n\n#RESCENE #리센느 #REMINE`}
      />
    </div>
  );
}
