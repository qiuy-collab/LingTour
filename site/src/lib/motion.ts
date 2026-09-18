import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Duration scale, in **seconds**. Every tween picks a step from here instead of
 * inventing a number — the site previously carried 19 unrelated durations
 * (0.24 … 1.1s) because there was no scale to pick from.
 */
export const motionDuration = {
  fast: 0.2,
  standard: 0.32,
  medium: 0.45,
  slow: 0.7,
  cinematic: 1.1,
} as const;

export const motionEase = {
  enter: "power3.out",
  exit: "power2.in",
  emphasized: "expo.out",
  /**
   * For anything that lands, stamps, or settles: fast arrival plus one small
   * rebound. The rotation entrances previously used `expo.out`, which is the
   * slowest-crawling choice at the end — it reads as drift, not impact.
   */
  stamp: "back.out(1.6)",
} as const;

/**
 * A single scrub for the whole page. Mixing 0.2 and 0.9 on one page makes
 * stacked parallax layers drift apart from each other as you scroll.
 */
export const motionScrub = 0.45;

/**
 * Breakpoint media queries. Four different strings were in use before
 * (768px / 768px+pointer / 1024px / 1024px+pointer); build matchMedia
 * conditions from these instead of retyping them.
 */
export const motionMedia = {
  tablet: "(min-width: 768px)",
  desktop: "(min-width: 1024px)",
  finePointer: "(pointer: fine)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  allowMotion: "(prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger, useGSAP };