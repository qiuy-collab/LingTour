"use client";

import { useRef } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type CultureIndexHeroProps = {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  cityCount: number;
  regionCount: number;
  archiveLabel: string;
  archiveCode: string;
};

export function CultureIndexHero({
  image,
  eyebrow,
  title,
  accent,
  lede,
  cityCount,
  regionCount,
  archiveLabel,
  archiveCode,
}: CultureIndexHeroProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
        timeline
          .fromTo(
            "[data-culture-copy] > *",
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.075 },
          )
          .fromTo(
            "[data-culture-frame]",
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "expo.out" },
            "-=0.55",
          )
          .fromTo(
            "[data-culture-index]",
            { autoAlpha: 0, x: 16 },
            { autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.08 },
            "-=0.45",
          );

        gsap.fromTo(
          "[data-culture-frame] img",
          { scale: 1.06 },
          { scale: 1, duration: 1.4, ease: "power2.out" },
        );
      });

      return () => media.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="relative isolate overflow-hidden border-b border-[var(--line)] bg-[#e7e7e2] py-14 sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -right-[0.08em] top-4 font-[family:var(--font-display)] text-[clamp(8rem,24vw,23rem)] leading-none tracking-[-0.08em] text-white/42">
        INDEX
      </div>
      <div className="site-container relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.22fr)] lg:items-end lg:gap-14">
          <div data-culture-copy className="max-w-2xl pb-1">
            <p className="lt-kicker">{eyebrow}</p>
            <h1 className="mt-8 font-[family:var(--font-display)] text-[clamp(3.25rem,7.2vw,7rem)] leading-[0.84] tracking-[-0.065em] text-[var(--river-deep)]">
              {title}
              <span className="mt-1 block italic text-[var(--cinnabar)]">{accent}</span>
            </h1>
            <p className="mt-7 max-w-[36rem] text-sm leading-7 text-[var(--muted)] sm:text-base lg:mt-9">
              {lede}
            </p>
            <a
              href="#city-index"
              className="mt-8 inline-flex items-center gap-3 border-b border-[var(--river-deep)] pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--river-deep)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
            >
              Open city index <span aria-hidden>↘</span>
            </a>
          </div>

          <div className="relative min-w-0 pb-10 sm:pb-12 lg:pb-0">
            <div
              data-culture-frame
              className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--river-deep)] shadow-[0_28px_80px_rgba(17,25,35,0.16)] sm:aspect-[16/10]"
            >
              <img
                src={image}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(9,25,31,0.68))]" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/62">{archiveLabel}</p>
                  <p className="mt-1 font-[family:var(--font-display)] text-2xl sm:text-3xl">{archiveCode}</p>
                </div>
                <span className="rounded-full border border-white/40 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/78">
                  Guangdong
                </span>
              </div>
            </div>

            <div className="absolute -bottom-1 left-4 right-4 grid grid-cols-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_18px_45px_rgba(17,25,35,0.12)] sm:left-auto sm:right-8 sm:w-[20rem] lg:-bottom-8">
              <div data-culture-index className="border-r border-[var(--line)] px-5 py-4">
                <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{cityCount}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--muted)]">City files</p>
              </div>
              <div data-culture-index className="px-5 py-4">
                <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{regionCount}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--muted)]">Regions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
