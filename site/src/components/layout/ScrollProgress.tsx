"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";

export function ScrollProgress() {
  const scope = useRef<HTMLDivElement | null>(null);
  const bar = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!bar.current) return;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: 0,
              end: "max",
              scrub: 0.2,
            },
          },
        );
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope.current, { autoAlpha: 0 });
      });

      return () => media.revert();
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] origin-left"
    >
      <div
        ref={bar}
        className="h-full origin-left bg-[linear-gradient(90deg,var(--cinnabar),var(--gold),var(--river))] shadow-[0_0_18px_rgba(182,66,53,0.35)]"
      />
    </div>
  );
}
