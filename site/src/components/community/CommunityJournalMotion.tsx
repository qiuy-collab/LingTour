"use client";

import { type ReactNode, useRef } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

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
          const animatedElements = root.querySelectorAll(
            "[data-community-kicker], [data-community-title], [data-community-subtitle], [data-community-stamp], [data-community-ink]",
          );

          if (!animate) {
            gsap.set(animatedElements, { clearProps: "all" });
            return;
          }

          const intro = gsap.timeline({ defaults: { ease: motionEase.emphasized } });
          intro
            .from("[data-community-kicker]", { autoAlpha: 0, y: 14, duration: 0.55 })
            .from(
              "[data-community-title]",
              { autoAlpha: 0, yPercent: 115, rotation: 2.5, duration: 1.05, stagger: 0.12 },
              "-=0.25",
            )
            .from(
              "[data-community-subtitle]",
              { autoAlpha: 0, y: 22, duration: 0.7 },
              "-=0.52",
            )
            .from(
              "[data-community-stamp]",
              { autoAlpha: 0, scale: 0.72, rotation: -28, duration: 0.9 },
              "-=0.72",
            );

          gsap.to("[data-community-ink='left']", {
            yPercent: 26,
            xPercent: -5,
            rotation: -7,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-community-hero]",
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });

          gsap.to("[data-community-ink='right']", {
            yPercent: -18,
            xPercent: 7,
            rotation: 9,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-community-hero]",
              start: "top top",
              end: "bottom top",
              scrub: 0.9,
            },
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
          desktop: "(min-width: 768px) and (pointer: fine)",
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
            const handleEnter = () => gsap.set(card, { willChange: "transform" });
            const handleLeave = () => {
              moveX(0);
              moveY(0);
              rotate(0);
              gsap.set(card, { willChange: "auto", delay: 0.55 });
            };

            card.addEventListener("pointerenter", handleEnter);
            card.addEventListener("pointermove", handleMove);
            card.addEventListener("pointerleave", handleLeave);

            return () => {
              card.removeEventListener("pointerenter", handleEnter);
              card.removeEventListener("pointermove", handleMove);
              card.removeEventListener("pointerleave", handleLeave);
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
