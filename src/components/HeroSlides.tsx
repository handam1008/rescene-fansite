"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/data/site";
import { PauseIcon, PlayIcon } from "./Icons";

/** 다음 사진으로 넘어가는 간격 */
const INTERVAL = 6000;

/**
 * 홈 상단 사진 슬라이드. 몇 초마다 부드럽게 다음 사진으로 바뀜.
 * - 마우스를 올리거나 일시정지 버튼을 누르면 멈춤, 휴대폰은 옆으로 밀어서 넘김
 * - 움직임 줄이기 설정을 켠 사람에게는 자동으로 넘기지 않음
 * - 처음엔 지금 사진과 다음 사진만 불러와서 첫 화면이 느려지지 않게 함
 */
export default function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(Math.min(2, slides.length));
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = (i: number) => {
    const next = (i + count) % count;
    setCurrent(next);
    setMounted((m) => Math.max(m, Math.min(next + 2, count)));
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (count < 2 || hovered || stopped || reducedMotion) return;
    const t = setTimeout(() => go(current + 1), INTERVAL);
    return () => clearTimeout(t);
    // go 는 current·count 로만 계산되므로 의존성에서 뺌
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, hovered, stopped, reducedMotion, count]);

  if (count === 0) {
    return <div aria-hidden className="h-full w-full bg-gradient-to-br from-lilac-100 via-blush-100 to-sky-dream-100" />;
  }

  const paused = stopped || reducedMotion;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.slice(0, mounted).map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            // 원본이 2400px 라 레티나 화면에서도 선명하게. 대표 사진이라 화질을 기본(75)보다 높임
            quality={85}
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover"
            style={{ objectPosition: s.position }}
          />
        </div>
      ))}

      {/* PC에서 흰 글씨가 하얀 옷 위에서도 잘 읽히도록 아래쪽을 어둡게 (얼굴이 있는 위쪽은 그대로) */}
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-t from-ink/85 via-ink/35 via-35% to-transparent to-60% sm:block"
      />

      {/* 휴대폰은 왼쪽 아래 넘김 표시와 겹치지 않게 폭을 줄여 두 줄로 */}
      <p className="absolute right-2 bottom-2 max-w-[calc(100%-8.5rem)] bg-ink/45 px-1.5 py-0.5 text-right text-[10px] text-white sm:max-w-none">
        {slides[current].credit}
      </p>

      {/* 넘김 표시: 휴대폰은 왼쪽 아래(얼굴을 가리지 않게), PC 는 글씨와 겹치지 않게 오른쪽 위 */}
      {count > 1 && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-ink/35 px-2 py-1.5 backdrop-blur-sm sm:top-3 sm:right-3 sm:bottom-auto sm:left-auto">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1}번째 사진`}
              aria-current={i === current ? "true" : undefined}
              className={`h-2 transition-all hover:transform-none ${i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              aria-label={paused ? "사진 자동 넘김 다시 시작" : "사진 자동 넘김 멈추기"}
              className="ml-1 text-white/90 hover:text-white"
            >
              {paused ? <PlayIcon className="h-3.5 w-3.5" /> : <PauseIcon className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
