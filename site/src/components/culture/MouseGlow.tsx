"use client";

import { useCallback, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
};

export function MouseGlow({
  children,
  className = "",
  color = "rgba(255,255,255,0.08)",
  size = 400,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--glow-x", `${x}px`);
        el.style.setProperty("--glow-y", `${y}px`);
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--glow-x", "50%");
    el.style.setProperty("--glow-y", "50%");
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--glow-x": "50%",
          "--glow-y": "50%",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          background: `radial-gradient(${size}px at var(--glow-x) var(--glow-y), ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
