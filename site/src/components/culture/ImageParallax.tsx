"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  speed?: number; // parallax speed factor, default 0.3
};

export function ImageParallax({ children, className = "", speed = 0.3 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    let rafId: number;
    let currentY = 0;
    let targetY = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function onScroll() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const viewH = window.innerHeight;
      const elH = rect.height;
      const visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);

      if (visible <= 0) return;

      // Progress: 0 when entering bottom, 1 when leaving top
      const progress = (viewH - rect.top) / (viewH + elH);
      const clamped = Math.max(0, Math.min(1, progress));

      // Translate range: -speed*50px to +speed*50px
      targetY = (clamped - 0.5) * speed * 100;
    }

    function animate() {
      currentY = lerp(currentY, targetY, 0.08);
      const diff = Math.abs(currentY - targetY);
      if (diff > 0.01 && inner) {
        inner.style.transform = `translate3d(0, ${currentY}px, 0) scale(1.04)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
