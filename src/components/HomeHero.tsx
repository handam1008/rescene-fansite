import Image from "next/image";
import { hero } from "@/data/site";

/**
 * 홈 상단 큰 박스: 단체 사진이 박스를 꽉 채우고, 왼쪽 아래(옷 위)에 RESCENE과 문구가 흰 글씨로 겹쳐 보입니다.
 * 휴대폰에서는 사진을 위에, 글씨를 사진 아래에 둬서 얼굴을 가리지 않게 합니다.
 */
export default function HomeHero() {
  return (
    <section className="card overflow-hidden sm:relative sm:aspect-[12/5]">
      <div className="relative aspect-[2/1] sm:absolute sm:inset-0 sm:aspect-auto">
        {hero.image ? (
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            priority
            // 원본이 2400px 라 레티나 화면에서도 선명하게. 대표 사진이라 화질을 기본(75)보다 높임
            quality={85}
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover"
            style={{ objectPosition: hero.imagePosition }}
          />
        ) : (
          <div aria-hidden className="h-full w-full bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100" />
        )}
        {/* PC에서 흰 글씨가 하얀 옷 위에서도 잘 읽히도록 아래쪽을 어둡게 (얼굴이 있는 위쪽은 그대로) */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-t from-ink/85 via-ink/35 via-35% to-transparent to-60% sm:block"
        />
        {hero.image && hero.imageCredit && (
          <p className="absolute right-2 bottom-2 bg-ink/45 px-1.5 py-0.5 text-[10px] text-white">{hero.imageCredit}</p>
        )}
      </div>

      <div className="px-6 py-5 sm:absolute sm:inset-y-0 sm:left-0 sm:flex sm:flex-col sm:justify-end sm:px-10 sm:pt-0 sm:pb-8 lg:px-12 lg:pb-10">
        <h1 className="text-5xl font-black tracking-tight text-ink sm:text-6xl sm:text-white sm:text-shadow-lg lg:text-7xl">
          {hero.title}
        </h1>
        <p className="mt-2 text-base font-medium break-keep text-ink sm:text-xl sm:text-white sm:text-shadow-md lg:text-2xl">
          {hero.tagline}
        </p>
      </div>
    </section>
  );
}
