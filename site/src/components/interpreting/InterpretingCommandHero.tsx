"use client";

import { useRef } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type InterpretingCommandHeroProps = {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  serviceCount: number;
  interpreterCount: number;
  locale: "en" | "zh";
};

export function InterpretingCommandHero({
  image,
  eyebrow,
  title,
  accent,
  subtitle,
  primaryLabel,
  secondaryLabel,
  serviceCount,
  interpreterCount,
  locale,
}: InterpretingCommandHeroProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
        timeline
          .fromTo(
            "[data-command-copy] > *",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 },
          )
          .fromTo(
            "[data-command-visual]",
            { autoAlpha: 0, x: 34, clipPath: "inset(0 0 0 24%)" },
            { autoAlpha: 1, x: 0, clipPath: "inset(0 0 0 0%)", duration: 0.95, ease: "expo.out" },
            "-=0.5",
          )
          .fromTo(
            "[data-command-card]",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            "-=0.3",
          );

        gsap.to("[data-command-signal]", {
          scale: 1.9,
          autoAlpha: 0,
          duration: 1.8,
          ease: "power1.out",
          repeat: -1,
          repeatDelay: 0.25,
        });
      });

      return () => media.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="bg-[var(--paper-deep)] py-6 sm:py-10 lg:py-14">
      <div className="site-container">
        <div className="relative isolate overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-dark)] text-white shadow-[0_34px_110px_rgba(17,25,35,0.22)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(124,155,134,0.2),transparent_28rem),linear-gradient(135deg,transparent,rgba(255,255,255,0.025))]" />
          <div className="grid lg:min-h-[43rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)]">
            <div data-command-copy className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
              <div className="flex items-center gap-3">
                <span className="relative grid h-3 w-3 place-items-center rounded-full bg-[#8fd2a7]">
                  <span data-command-signal className="absolute inset-0 rounded-full border border-[#8fd2a7]" />
                </span>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-white/64">{eyebrow}</p>
              </div>

              <h1 className="mt-8 max-w-[10ch] font-[family:var(--font-display)] text-[clamp(3.2rem,7.2vw,7.4rem)] leading-[0.84] tracking-[-0.065em]">
                {title}
                <span className="mt-1 block italic text-[var(--gold)]">{accent}</span>
              </h1>
              <p className="mt-7 max-w-[35rem] text-sm leading-7 text-white/68 sm:text-base lg:mt-9">{subtitle}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#interpreting-booking" className="lt-action lt-action-gold">
                  {primaryLabel} <span aria-hidden>↘</span>
                </a>
                <a href="#service-types" className="lt-action border border-white/24 bg-white/8 text-white hover:bg-white/14">
                  {secondaryLabel}
                </a>
              </div>

              <div className="mt-10 grid max-w-[28rem] grid-cols-3 border-t border-white/16 pt-6">
                <div>
                  <p className="font-[family:var(--font-display)] text-3xl">{serviceCount}</p>
                  <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/42">Modes</p>
                </div>
                <div>
                  <p className="font-[family:var(--font-display)] text-3xl">{interpreterCount}</p>
                  <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/42">Guides</p>
                </div>
                <div>
                  <p className="font-[family:var(--font-display)] text-3xl">24h</p>
                  <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/42">Reply</p>
                </div>
              </div>
            </div>

            <div data-command-visual className="relative min-h-[25rem] overflow-hidden lg:min-h-full">
              <img src={image} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,34,41,0.04),rgba(13,34,41,0.2)_56%,rgba(13,34,41,0.8))] lg:bg-[linear-gradient(90deg,var(--surface-dark),transparent_24%),linear-gradient(180deg,transparent_50%,rgba(13,34,41,0.76))]" />

              <div data-command-card className="absolute bottom-5 left-5 right-5 rounded-[var(--radius-md)] border border-white/22 bg-[rgba(12,28,35,0.72)] p-5 backdrop-blur-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-[22rem] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/52">
                    {locale === "zh" ? "现场协调台" : "Field coordination desk"}
                  </p>
                  <span className="rounded-full bg-[#8fd2a7]/16 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#a9e2ba]">
                    Online
                  </span>
                </div>
                <p className="mt-4 font-[family:var(--font-display)] text-2xl leading-tight text-white">
                  {locale === "zh" ? "先说明场景，再匹配合适的人。" : "Tell us the scene. We match the right person."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["EN / 中文", "Culture", "Route", "Business"].map((label) => (
                    <span key={label} className="rounded-full border border-white/18 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/62">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
