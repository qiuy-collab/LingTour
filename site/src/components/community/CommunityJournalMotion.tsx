"use client";

import { type ReactNode, useRef } from "react";
import { gsap, motionDuration, motionEase, motionMedia, useGSAP } from "@/lib/motion";

type CommunityJournalMotionProps = {
  children: ReactNode;
  motionKey: string;
};

export function CommunityJournalMotion({ children, motionKey }: CommunityJournalMotionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const media = gsap.matchMedia();

      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { animate } = context.conditions ?? {};
          const animatedElements = root.querySelectorAll("[data-community-title]");

          if (!animate) {
            gsap.set(animatedElements, { clearProps: "all" });
            return;
          }

          // The hero renders two title lines and nothing else from this hook.
          // kicker / subtitle / stamp were queried here but never rendered on
          // the page — dead scaffolding of the same kind as the pastoral titles.
          gsap.from("[data-community-title]", {
            autoAlpha: 0,
            yPercent: 115,
            rotation: 2.5,
            duration: motionDuration.cinematic,
            stagger: 0.12,
            ease: motionEase.emphasized,
          });

          gsap.from("[data-community-toolbar]", {
            autoAlpha: 0,
            y: 18,
            duration: 0.7,
            ease: motionEase.enter,
            scrollTrigger: {
              trigger: "[data-community-toolbar]",
              start: "top 92%",
              once: true,
            },
          });

        },
      );

      return () => media.revert();
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const media = gsap.matchMedia();
      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: `${motionMedia.tablet} and ${motionMedia.finePointer}`,
        },
        (context) => {
          const { animate, desktop } = context.conditions ?? {};
          if (!animate || !desktop) return;

          const cards = gsap.utils.toArray<HTMLElement>("[data-community-card]", root);
          const removeListeners = cards.map((card) => {
            const moveX = gsap.quickTo(card, "x", { duration: 0.42, ease: "power3.out" });
            const moveY = gsap.quickTo(card, "y", { duration: 0.42, ease: "power3.out" });
            const rotate = gsap.quickTo(card, "rotation", { duration: 0.5, ease: "power3.out" });

            const handleMove = (event: PointerEvent) => {
              const bounds = card.getBoundingClientRect();
              const localX = (event.clientX - bounds.left) / bounds.width - 0.5;
              const localY = (event.clientY - bounds.top) / bounds.height - 0.5;
              moveX(localX * 5);
              moveY(localY * 4);
              rotate(localX * 0.7);
            };
            // See ProductDetailHero: a delayed gsap.set is not cancellable, so
            // re-entering inside the delay left the layer hint removed.
            let willChangeCall: gsap.core.Tween | null = null;
            const handleEnter = () => {
              willChangeCall?.kill();
              willChangeCall = null;
              gsap.set(card, { willChange: "transform" });
            };
            const handleLeave = () => {
              moveX(0);
              moveY(0);
              rotate(0);
              willChangeCall?.kill();
              willChangeCall = gsap.delayedCall(0.55, () => gsap.set(card, { willChange: "auto" }));
            };

            card.addEventListener("pointerenter", handleEnter);
            card.addEventListener("pointermove", handleMove);
            card.addEventListener("pointerleave", handleLeave);

            return () => {
              card.removeEventListener("pointerenter", handleEnter);
              card.removeEventListener("pointermove", handleMove);
              card.removeEventListener("pointerleave", handleLeave);
              willChangeCall?.kill();
            };
          });

          return () => removeListeners.forEach((remove) => remove());
        },
      );

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [motionKey], revertOnUpdate: true },
  );

  return <div ref={rootRef}>{children}</div>;
}
