"use client";

import { type ReactNode, useRef } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  duration?: number;
};

export function Reveal({ children, delay = 0, className = "", threshold = 0.12, duration = 750 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const media = gsap.matchMedia();

      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const { animate, desktop } = context.conditions ?? {};
          if (!animate || !desktop) {
            gsap.set(ref.current, { clearProps: "all" });
            return;
          }

          const triggerPoint = Math.max(78, Math.min(94, 95 - threshold * 50));
          gsap.fromTo(
            ref.current,
            {
              autoAlpha: 0,
              y: 28,
              clipPath: "inset(0 0 10% 0)",
            },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: duration / 1000,
              delay: delay / 1000,
              ease: motionEase.enter,
              clearProps: "clipPath",
              scrollTrigger: {
                trigger: ref.current,
                start: `top ${triggerPoint}%`,
                once: true,
              },
            },
          );
        },
      );

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
