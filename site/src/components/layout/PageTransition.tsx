"use client";

import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!page.current) return;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          page.current,
          { y: 10 },
          {
            y: 0,
            duration: 0.38,
            ease: motionEase.enter,
            clearProps: "transform",
          },
        );
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(page.current, { clearProps: "all" });
      });

      return () => media.revert();
    },
    { scope: page, dependencies: [pathname] },
  );

  return (
    <div key={pathname} ref={page} data-page-root>
      {children}
    </div>
  );
}
