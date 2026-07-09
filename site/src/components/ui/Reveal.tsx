"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  duration?: number;
};

export function Reveal({ children, delay = 0, className = "", threshold = 0.12, duration = 750 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    // On mobile we prefer immediate content over delayed scroll-reveals so
    // sections never read as broken blank space while swiping.
    if (prefersReducedMotion || isMobile) {
      setCanAnimate(false);
      setVisible(true);
      return;
    }

    setCanAnimate(true);

    // Keep content readable even before the observer fires; on slower mobile-like
    // environments we never want sections to look empty while hydration catches up.
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -80px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
        canAnimate
          ? visible
            ? "translate-y-0 opacity-100 blur-0"
            : "translate-y-6 opacity-100 blur-0"
          : "translate-y-0 opacity-100 blur-0"
      } ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
