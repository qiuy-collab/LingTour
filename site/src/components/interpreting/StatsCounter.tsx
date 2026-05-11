"use client";

import { useRef, useState, useEffect } from "react";

interface StatsCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export function StatsCounter({ value, suffix = "", label, duration = 1800 }: StatsCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    const el = ref.current;
    if (!el) return;

    const startCounting = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    // IntersectionObserver — fires as soon as any pixel is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);

    // Fallback: 2s timeout in case observer never fires
    const fallback = setTimeout(startCounting, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [value, duration]);

  return (
    <div ref={ref} className="px-4 py-4 backdrop-blur-sm">
      <p className="font-[family:var(--font-display)] text-2xl text-white tabular-nums">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/46">{label}</p>
    </div>
  );
}
