"use client";

import { type ReactNode, useRef } from "react";
import { gsap, motionEase, ScrollTrigger, useGSAP } from "@/lib/motion";

type PastoralPageMotionProps = {
  children: ReactNode;
  className?: string;
  motionKey?: string;
};

export function PastoralPageMotion({
  children,
  className = "",
  motionKey = "default",
}: PastoralPageMotionProps) {
  const scope = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!scope.current) return;

      const media = gsap.matchMedia();
      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const heroMedia = gsap.utils.toArray<HTMLElement>("[data-pastoral-hero-media]");
          const cards = gsap.utils.toArray<HTMLElement>("[data-pastoral-card]");

          if (!context.conditions?.animate) {
            gsap.set([...heroMedia, ...cards], { clearProps: "all" });
            return;
          }

          cards.forEach((card, index) => {
            gsap.fromTo(
              card,
              { autoAlpha: 0, y: context.conditions?.desktop ? 38 : 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.76,
                delay: (index % 2) * 0.08,
                ease: motionEase.enter,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });

          if (context.conditions?.desktop) {
            heroMedia.forEach((image) => {
              gsap.fromTo(
                image,
                { scale: 1.06, yPercent: -2 },
                {
                  scale: 1.1,
                  yPercent: 5,
                  ease: "none",
                  scrollTrigger: {
                    trigger: image.closest("section") ?? scope.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.7,
                  },
                },
              );
            });
          }
        },
      );

      return () => {
        window.cancelAnimationFrame(refreshFrame);
        media.revert();
      };
    },
    { scope, dependencies: [motionKey], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
