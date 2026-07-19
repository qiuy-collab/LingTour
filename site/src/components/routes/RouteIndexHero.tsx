"use client";

import { useRef } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type RouteIndexHeroProps = {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  routeCount: number;
  regionCount: number;
};

export function RouteIndexHero({
  image,
  eyebrow,
  title,
  accent,
  lede,
  routeCount,
  regionCount,
}: RouteIndexHeroProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          if (!context.conditions?.animate) return;

          const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
          timeline
            .fromTo(
              "[data-route-hero-kicker]",
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.45 },
            )
            .fromTo(
              "[data-route-hero-title] > span",
              { autoAlpha: 0, yPercent: 110 },
              { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.08 },
              "-=0.18",
            )
            .fromTo(
              "[data-route-hero-meta]",
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
              "-=0.45",
            );

          if (context.conditions?.desktop) {
            gsap.fromTo(
              "[data-route-hero-media]",
              { scale: 1.08, yPercent: 0 },
              {
                scale: 1.14,
                yPercent: 9,
                ease: "none",
                scrollTrigger: {
                  trigger: scope.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: 0.6,
                },
              },
            );
          }
        },
      );

      return () => media.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="relative isolate flex min-h-[40rem] items-end overflow-hidden bg-[var(--night)] text-white md:min-h-[calc(100svh-4.5rem)]"
    >
      <img
        data-route-hero-media
        src={image}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-[112%] w-full object-cover object-center opacity-78"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,24,0.12),rgba(8,18,24,0.34)_40%,rgba(8,18,24,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,24,0.6),transparent_64%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

      <div className="site-container relative z-10 pb-8 pt-28 sm:pb-12 lg:pb-14">
        <div className="flex items-center justify-between border-b border-white/24 pb-5">
          <p
            data-route-hero-kicker
            className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-white/72"
          >
            {eyebrow}
          </p>
          <a
            href="#route-index"
            className="hidden items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-white/58 transition hover:text-white sm:inline-flex"
          >
            Browse the index
            <span aria-hidden>↓</span>
          </a>
        </div>

        <div className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-14">
          <div className="min-w-0">
            <h1
              data-route-hero-title
              className="max-w-[12ch] overflow-hidden font-[family:var(--font-display)] text-[clamp(3.4rem,9vw,8.5rem)] font-medium leading-[0.82] tracking-[-0.065em]"
            >
              <span className="block">{title}</span>
              <span className="block pb-[0.08em] italic text-[var(--gold)]">{accent}</span>
            </h1>
          </div>

          <div className="grid gap-6 sm:grid-cols-[1fr_auto_auto] sm:items-end lg:grid-cols-1">
            <p
              data-route-hero-meta
              className="max-w-[34rem] text-sm leading-7 text-white/72 sm:text-base lg:max-w-[26rem]"
            >
              {lede}
            </p>
            <div data-route-hero-meta className="flex gap-7 border-t border-white/20 pt-5">
              <div>
                <p className="font-[family:var(--font-display)] text-3xl text-white">{routeCount}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/48">Routes</p>
              </div>
              <div>
                <p className="font-[family:var(--font-display)] text-3xl text-white">{regionCount}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/48">Regions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
