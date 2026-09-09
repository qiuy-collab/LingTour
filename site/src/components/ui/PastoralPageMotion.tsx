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
          const heroMedia = gsap.utils.toArray<HTMLElement>("[data-pastoral-hero-media]", scope.current);
          const cards = gsap.utils.toArray<HTMLElement>("[data-pastoral-card]", scope.current);
          const introElements = gsap.utils.toArray<HTMLElement>(
            "[data-pastoral-kicker], [data-pastoral-subtitle], [data-pastoral-stamp]",
            scope.current,
          );

          if (!context.conditions?.animate) {
            gsap.set([...heroMedia, ...cards, ...introElements], { clearProps: "all" });
            return;
          }

          const kicker = scope.current?.querySelector<HTMLElement>("[data-pastoral-kicker]");
          const subtitle = scope.current?.querySelector<HTMLElement>("[data-pastoral-subtitle]");
          const stamp = scope.current?.querySelector<HTMLElement>("[data-pastoral-stamp]");

          if (kicker || subtitle || stamp) {
            const intro = gsap.timeline({ defaults: { ease: motionEase.emphasized } });
            if (kicker) {
              intro.from(kicker, { autoAlpha: 0, y: 12, duration: 0.45 });
            }
            if (subtitle) {
              intro.from(subtitle, { autoAlpha: 0, y: 14, duration: 0.55 }, kicker ? "-=0.16" : 0);
            }
            if (stamp) {
              intro.from(stamp, { autoAlpha: 0, scale: 0.72, rotation: -16, duration: 0.9 }, "-=0.72");
            }
          }

          cards.forEach((card, index) => {
            gsap.fromTo(
              card,
              { y: context.conditions?.desktop ? 20 : 12 },
              {
                y: 0,
                duration: 0.55,
                delay: (index % 2) * 0.06,
                ease: motionEase.enter,
                clearProps: "transform",
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
