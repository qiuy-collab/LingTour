"use client";

import { type ReactNode, useRef } from "react";
import { gsap, motionDuration, motionEase, motionMedia, useGSAP } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  className?: string;
  threshold?: number;
  /** Seconds. */
  duration?: number;
};

/**
 * The site's only entrance primitive (~45-60 static instances, more once data
 * lists multiply it).
 *
 * It animates `y` only — never opacity — so a failed script, a reduced-motion
 * preference, or a teardown can never leave content stuck invisible.
 *
 * It is deliberately NOT gated on a desktop breakpoint: previously everything
 * under 768px was skipped entirely, which meant phones had no entrance motion
 * anywhere on the site while the far more expensive scrub parallax stayed.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  threshold = 0.12,
  duration = motionDuration.slow,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      // A breakpoint change tears down and rebuilds every matchMedia context.
      // Without this marker, `once: true` ScrollTriggers are recreated and any
      // element already past its trigger line replays its entrance.
      if (element.dataset.revealed === "true") return;

      const media = gsap.matchMedia();

      media.add(motionMedia.allowMotion, () => {
        const triggerPoint = Math.max(78, Math.min(94, 95 - threshold * 50));
        gsap.fromTo(
          element,
          { y: 12 },
          {
            y: 0,
            duration,
            delay,
            ease: motionEase.enter,
            clearProps: "transform",
            onComplete: () => {
              element.dataset.revealed = "true";
            },
            scrollTrigger: {
              trigger: element,
              start: `top ${triggerPoint}%`,
              once: true,
            },
          },
        );
      });

      return () => media.revert();
    },
    { scope: ref, dependencies: [delay, duration, threshold] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}