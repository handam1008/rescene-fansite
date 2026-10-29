import { hero } from "@/data/site";
import { getI18n } from "@/i18n/server";
import HeroSlides from "./HeroSlides";

/**
 * 홈 상단 큰 박스: 단체 사진(몇 초마다 바뀜)이 박스를 꽉 채우고, 왼쪽 아래(옷 위)에 RESCENE과 문구가 흰 글씨로 겹쳐 보입니다.
 * 휴대폰에서는 사진을 위에, 글씨를 사진 아래에 둬서 얼굴을 가리지 않게 합니다.
 */
export default async function HomeHero() {
  const { m } = await getI18n();
  return (
    <section className="card overflow-hidden sm:relative sm:aspect-[12/5]">
      <div className="relative aspect-[2/1] sm:absolute sm:inset-0 sm:aspect-auto">
        <HeroSlides slides={hero.slides} />
      </div>

      {/* 글씨 위를 눌러도 사진 슬라이드가 방해받지 않게 pointer-events 끔 */}
      <div className="px-6 py-5 sm:pointer-events-none sm:absolute sm:inset-y-0 sm:left-0 sm:flex sm:flex-col sm:justify-end sm:px-10 sm:pt-0 sm:pb-8 lg:px-12 lg:pb-10">
        <h1 className="text-5xl font-black tracking-tight text-ink sm:text-6xl sm:text-white sm:text-shadow-lg lg:text-7xl">
          {hero.title}
        </h1>
        <p className="mt-2 text-base font-medium break-keep text-ink sm:text-xl sm:text-white sm:text-shadow-md lg:text-2xl">
          {m.hero.tagline}
        </p>
      </div>
    </section>
  );
}
