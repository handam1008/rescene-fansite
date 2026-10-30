import { members, type Member } from "@/data/members";
import { contributorTitleFor, titleFor, titleName } from "@/data/titles";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";
import { nicknameFormatOk } from "@/lib/nickname";
import { createPublicClient } from "@/lib/supabase/public";
import type { CardParams } from "./card-query";

export { cardQuery, hasCard, parseCardParams, type CardParams } from "./card-query";

/** 나만의 리마인 카드에 들어갈 내용 (주소 형식은 card-query.ts). 링크만 보내면 같은 카드가 보임 */
export type CardData = {
  name: string;
  fav: Member[];
  badges: string[];
  collected?: number;
  pioneer?: number;
};

export async function getCardData(p: CardParams, locale: Locale): Promise<CardData> {
  const m = dictionaries[locale];
  const fav = members.filter((x) => p.fav.includes(x.slug));
  let name = m.auth.defaultNickname;
  const badges: string[] = [];
  let collected: number | undefined;
  let pioneer: number | undefined;

  if (p.u) {
    const { data } = await createPublicClient().from("profiles").select("*").eq("id", p.u).maybeSingle();
    if (data) {
      name = String(data.nickname ?? name);
      if (data.is_admin) badges.push(m.auth.admin);
      if (p.s) {
        collected = Number(data.collected_count ?? 0);
        pioneer = Number(data.contributed_count ?? 0);
        const c = contributorTitleFor(data.contributor_rank as number | null, pioneer);
        if (c) badges.push(titleName(c, locale));
        const t = titleFor(collected);
        if (t) badges.push(titleName(t, locale));
      }
    }
  } else if (p.name && nicknameFormatOk(p.name) && !/(운영자|관리자|admin)/i.test(p.name)) {
    name = p.name;
  }
  return { name, fav, badges, collected, pioneer };
}
