"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import type { StoryRoute } from "@/data/routes";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type Props = { route: StoryRoute };

function truncate(value: string, max = 150): string {
  const clean = value.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
}

function splitAudience(value: string): string[] {
  return value
    .split(/,|\/|&|\band\b/gi)
    .map((token) => token.trim())
    .filter(Boolean);
}

type ChipVariant = "paper" | "muted";

const CHIP_STYLES: Record<ChipVariant, string> = {
  paper:
    "border-[var(--line)] bg-white/50 text-[var(--river-deep)]/80 backdrop-blur-[1px]",
  muted:
    "border-[var(--line)] bg-[var(--paper)] text-[var(--river-deep)]/72",
};

function TagGroup({
  label,
  chips,
  variant,
}: {
  label: string;
  chips: string[];
  variant: ChipVariant;
}) {
  if (chips.length === 0) return null;
  const chipClass = CHIP_STYLES[variant];

  return (
    <section>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]/80">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            data-route-brief-chip
            className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] ${chipClass}`}
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}

export function RouteBrief({ route }: Props) {
  const briefRef = useRef<HTMLElement | null>(null);
  const promiseTitle = useMemo(() => {
    return route.title.trim() || "Route Promise";
  }, [route.title]);

  const promiseBody = useMemo(() => {
    return truncate(route.summary || route.story || route.title, 180);
  }, [route.story, route.summary, route.title]);

  const stopNameChips = route.itinerary
    .slice(0, 4)
    .map((stop) => stop.stop)
    .filter(Boolean);

  const bestMoment = useMemo(() => {
    const selected =
      route.itinerary.find((stop) => stop.meal)?.story ||
      route.itinerary.find((stop) => stop.culturalStory)?.plan ||
      route.itinerary.find((stop) => stop.story)?.story ||
      route.itinerary[0]?.plan ||
      route.itinerary[0]?.stop ||
      route.title;
    return truncate(selected, 90);
  }, [route.itinerary, route.title]);

  const bestForChips = splitAudience(route.audience);
  const experienceChips = stopNameChips.length > 0 ? stopNameChips : [route.culture];
  const paceChips = [route.duration, `${route.itinerary.length} stops`, route.culture].filter(
    Boolean,
  );

  useGSAP(
    () => {
      const section = briefRef.current;
      if (!section) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
        timeline
          .from("[data-route-brief-kicker]", { autoAlpha: 0, y: 12, duration: 0.5 })
          .from("[data-route-brief-title]", { autoAlpha: 0, y: 32, duration: 0.82 }, "-=0.2")
          .from("[data-route-brief-body]", { autoAlpha: 0, y: 20, duration: 0.64 }, "-=0.45")
          .from("[data-route-brief-actions]", { autoAlpha: 0, y: 12, duration: 0.5 }, "-=0.3")
          .from("[data-route-brief-chip]", { autoAlpha: 0, y: 10, rotation: 1.4, duration: 0.38, stagger: 0.045 }, "-=0.42")
          .from("[data-route-best-moment]", { autoAlpha: 0, x: 18, duration: 0.58 }, "-=0.25");
      });
      return () => media.revert();
    },
    { scope: briefRef, dependencies: [route.slug], revertOnUpdate: true },
  );

  return (
    <section ref={briefRef} className="relative border-b border-[var(--line)] bg-[var(--background)] bg-grain">
      <div className="site-container py-10 sm:py-12 lg:py-16">
        <div className="grid gap-10 min-[620px]:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.8fr)] min-[620px]:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-14">
          <div className="max-w-4xl">
            <p data-route-brief-kicker className="font-mono text-[9px] font-bold uppercase tracking-[0.34em] text-[var(--cinnabar)]/80">
              Route Promise
            </p>
            <h1 data-route-brief-title className="mt-4 max-w-[15ch] font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-tight text-[var(--river-deep)] sm:text-5xl md:text-6xl xl:text-7xl">
              {promiseTitle}
            </h1>
            <div data-route-brief-body>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] lg:text-lg">
              {promiseBody}
            </p>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--river-deep)]/55">
              {route.city} / {route.culture} / {route.duration}
            </p>
            </div>

            <div data-route-brief-actions className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9">
              <Link
                href="/interpreting/#interpreting-booking"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[var(--cinnabar)] px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white transition-all hover:bg-[var(--river-deep)] active:scale-[0.98] sm:w-auto"
              >
                <span>Book this route</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  -&gt;
                </span>
              </Link>
              <Link
                href="#itinerary"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--river-deep)] underline-offset-4 hover:underline"
              >
                Read the day
              </Link>
              <Link
                href={route.citySlugs[0] ? `/culture/${route.citySlugs[0]}` : "/culture"}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--river-deep)] underline-offset-4 hover:underline"
              >
                Open city file
              </Link>
            </div>
          </div>

          <div className="grid gap-8 self-start lg:pt-3">
            <div className="grid gap-6">
              <TagGroup label="Best for" chips={bestForChips} variant="paper" />
              <TagGroup
                label="You will experience"
                chips={experienceChips}
                variant="paper"
              />
              <TagGroup label="Pace" chips={paceChips} variant="muted" />
            </div>

            <section data-route-best-moment className="border-l-2 border-[var(--gold)] pl-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
                Best moment
              </p>
              <p className="mt-3 max-w-[28rem] text-lg italic leading-[1.8] text-[var(--river-deep)]/82 handwritten lg:text-[20px]">
                {bestMoment}
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
