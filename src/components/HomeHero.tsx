import Image from "next/image";
import { hero } from "@/data/site";

/** "향기로 다시(RE) 장면(SCENE)을…" 에서 괄호 안 영어만 강조 */
function Tagline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\([A-Za-z]+\))/).map((part, i) =>
        /^\([A-Za-z]+\)$/.test(part) ? (
          <span key={i} className="font-bold text-lilac-500">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** 홈 상단 큰 박스: 왼쪽에 RESCENE과 문구, 오른쪽에 멤버 사진 */
export default function HomeHero() {
  return (
    <section className="card relative h-[440px] overflow-hidden sm:h-[420px]">
      {/* 오른쪽 사진 영역 (휴대폰에서는 박스 전체) */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-[62%]">
        {hero.image ? (
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            priority
            sizes="(min-width: 640px) 62vw, 100vw"
            className="object-cover"
            style={{ objectPosition: hero.imagePosition }}
          />
        ) : (
          <div aria-hidden className="h-full w-full bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100" />
        )}
        {/* 글씨가 잘 보이도록 흰색으로 부드럽게 섞기 (휴대폰: 아래쪽, PC: 왼쪽) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-white from-25% via-white/60 via-45% to-transparent to-65% sm:bg-gradient-to-r sm:from-white sm:from-0% sm:via-white/0 sm:via-40% sm:to-transparent"
        />
      </div>

      {/* 글씨 (휴대폰: 아래쪽, PC: 왼쪽 가운데) */}
      <div className="relative flex h-full max-w-[34rem] flex-col justify-end px-6 pb-8 sm:justify-center sm:px-12 sm:pb-0">
        <h1 className="text-dreamy text-5xl font-extrabold tracking-wide sm:text-7xl">{hero.title}</h1>
        <p className="mt-3 text-base leading-relaxed break-keep text-ink sm:mt-4 sm:text-xl">
          <Tagline text={hero.tagline} />
        </p>
      </div>

      {hero.image && hero.imageCredit && (
        <p className="absolute right-3 bottom-2 text-[10px] text-white/80 drop-shadow">{hero.imageCredit}</p>
      )}
    </section>
  );
}
