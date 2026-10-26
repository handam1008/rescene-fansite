import Image from "next/image";
import { hero } from "@/data/site";

/**
 * 홈 상단 큰 박스: 단체 사진이 박스를 꽉 채우고, 왼쪽에 RESCENE과 문구가 겹쳐 보입니다.
 * 휴대폰에서는 사진을 위에, 글씨를 사진 아래에 둬서 얼굴을 가리지 않게 합니다.
 */
export default function HomeHero() {
  return (
    <section className="card overflow-hidden sm:relative sm:aspect-[14/5]">
      <div className="relative aspect-[2/1] sm:absolute sm:inset-0 sm:aspect-auto">
        {hero.image ? (
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover"
            style={{ objectPosition: hero.imagePosition }}
          />
        ) : (
          <div aria-hidden className="h-full w-full bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100" />
        )}
        {/* PC에서 글씨가 사진 위에서도 잘 읽히도록 왼쪽만 살짝 밝게 */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-r from-white/70 via-white/25 via-35% to-transparent to-60% sm:block"
        />
        {hero.image && hero.imageCredit && (
          <p className="absolute right-3 bottom-2 text-[10px] text-white/90 drop-shadow">{hero.imageCredit}</p>
        )}
      </div>

      <div className="px-6 py-5 sm:absolute sm:inset-y-0 sm:left-0 sm:flex sm:flex-col sm:justify-center sm:px-12 sm:py-0">
        <h1 className="text-5xl font-black tracking-tight text-ink sm:text-7xl lg:text-8xl">{hero.title}</h1>
        <p className="mt-2 text-base break-keep text-ink sm:text-xl lg:text-2xl">{hero.tagline}</p>
      </div>
    </section>
  );
}
