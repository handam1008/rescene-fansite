import { getMember, pokedexMemberName } from "@/data/members";
import { cardLabel, setName } from "@/data/pokedex-sets";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { catalogImageUrl } from "@/lib/storage-url";
import type { CatalogCard } from "@/types";

/**
 * 도감 카드 이미지. 아직 이미지가 없으면 멤버 색 바탕에 이름·구분을 적은 자리표시를 보여줍니다.
 * dim: 아직 못 모은 카드처럼 흐리게
 */
export default async function CardImage({
  card,
  dim = false,
  className = "",
}: {
  card: Pick<CatalogCard, "album" | "member" | "label" | "image_path">;
  dim?: boolean;
  className?: string;
}) {
  const { m, locale } = await getI18n();
  const name = pokedexMemberName(card.member, locale);
  const label = card.label ? cardLabel(card.label, locale) : "";
  const album = setName(card.album, locale);
  const box = `aspect-[55/85] w-full border border-lilac-200 ${className}`;

  if (!card.image_path) {
    const color = getMember(card.member)?.color ?? "#e0d4ff";
    return (
      <div
        role="img"
        aria-label={fmt(m.pokedex.photoWantedAria, { album, member: name, label })}
        className={`${box} flex flex-col items-center justify-center gap-1 p-2 text-center ${dim ? "opacity-60" : ""}`}
        style={{ background: `linear-gradient(160deg, ${color}66, #ffffff 70%)` }}
      >
        <span className="text-lg font-black text-ink">{name}</span>
        {label && <span className="text-[10px] leading-tight break-keep text-ink-soft">{label}</span>}
        <span className="mt-1 text-[9px] text-ink-soft/70">{m.pokedex.photoWanted}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 이미지
    <img
      src={catalogImageUrl(card.image_path)}
      alt={`${album} ${name} ${label}`}
      loading="lazy"
      className={`${box} object-cover transition ${dim ? "opacity-35 grayscale group-hover:opacity-60" : ""}`}
    />
  );
}
