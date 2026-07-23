"use client";

import Link from "next/link";
import { useRef } from "react";
import type { HomeHeroStat } from "@/types/content";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type HomeAtlasHeroProps = {
  image: string;
  eyebrow: string;
  titleLine1: string;
  accent: string;
  titleLine3: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  tags: string[];
  stats: HomeHeroStat[];
};

export function HomeAtlasHero({
  image,
  eyebrow,
  titleLine1,
  accent,
  titleLine3,
  body,
  primaryLabel,
  secondaryLabel,
  tags,
  stats,
}: HomeAtlasHeroProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          if (!context.conditions?.animate) return;
          const root = scope.current;
          if (!root) return;
          const copyItems = gsap.utils.toArray<HTMLElement>("[data-home-copy] > *", root);
          const statItems = gsap.utils.toArray<HTMLElement>("[data-home-stat]", root);
          const heroMedia = root.querySelector<HTMLElement>("[data-home-media]");
          const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
          if (copyItems.length > 0) {
            timeline.fromTo(
              copyItems,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.07 },
            );
          }
          if (statItems.length > 0) {
            timeline.fromTo(
              statItems,
              { autoAlpha: 0, y: 14 },
              { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.055 },
              "-=0.35",
            );
          }

          if (context.conditions?.desktop && heroMedia) {
            gsap.fromTo(
              heroMedia,
              { scale: 1.04, xPercent: 0 },
              {
                scale: 1.1,
                xPercent: 2,
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
      className="relative isolate flex min-h-[44rem] overflow-hidden border-b border-[var(--line)] bg-[var(--night)] text-white lg:min-h-[calc(100svh-4.5rem)] lg:bg-[var(--background)] lg:text-[var(--river-deep)]"
    >
      <div className="absolute inset-0 overflow-hidden lg:left-[43%]">
        <img
          data-home-media
          src={image}
          alt="Guangdong landscape showcasing cultural heritage and scenic beauty"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,24,0.12),rgba(8,18,24,0.36)_45%,rgba(8,18,24,0.92))] lg:bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_40%,rgba(236,233,226,0.9)_49%,rgba(236,233,226,0.16)_72%)]" />

      <div className="site-container relative z-10 flex w-full flex-col justify-end pb-7 pt-28 sm:pb-10 lg:justify-center lg:pb-12 lg:pt-16">
        <div data-home-copy className="max-w-[46rem] lg:max-w-[50rem]">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/68 lg:text-[var(--cinnabar)]">
            {eyebrow}
          </p>
          <h1 className="mt-7 max-w-[10.5ch] font-[family:var(--font-display)] text-[clamp(3.35rem,7.8vw,8rem)] leading-[0.82] tracking-[-0.07em]">
            {titleLine1}
            <span className="mt-1 block italic text-[var(--gold)]">{accent}</span>
            <span className="block">{titleLine3}</span>
          </h1>
          <p className="mt-7 max-w-[35rem] text-sm leading-7 text-white/72 sm:text-base lg:mt-9 lg:text-[var(--muted)]">
            {body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/interpreting" className="lt-action lt-action-gold">
              {primaryLabel} <span aria-hidden>↗</span>
            </Link>
            <Link href="/routes" className="btn-ghost-dark inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-[10px]">
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 border-t border-white/22 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:absolute lg:bottom-10 lg:left-[var(--space-gutter)] lg:right-[var(--space-gutter)] lg:mt-0 lg:border-[var(--line)]">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {tags.map((label) => (
              <span key={label} className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/54 lg:text-[var(--muted)]">
                {label}
              </span>
            ))}
          </div>
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 sm:flex sm:gap-7">
              {stats.slice(0, 4).map((stat) => (
                <div data-home-stat key={`${stat.title}-${stat.body}`} className="min-w-0">
                  <p className="font-[family:var(--font-display)] text-2xl text-white lg:text-[var(--river-deep)]">{stat.title}</p>
                  <p className="mt-1 max-w-[9rem] truncate font-mono text-[7px] uppercase tracking-[0.16em] text-white/44 lg:text-[var(--muted)]">{stat.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
