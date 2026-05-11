"use client";

import { useEffect, useRef, useState } from "react";

interface BookingFlowLineProps {
  stepIds: string[];
  containerId: string;
}

export function BookingFlowLine({ stepIds, containerId }: BookingFlowLineProps) {
  const lineRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const totalH = rect.height;
      const scrolled = window.innerHeight - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalH));
      setProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerId]);

  // Build a smooth vertical S‑curve through the steps
  const total = stepIds.length;
  const segH = 100 / total; // % per segment
  let d = `M 0 0`;

  for (let i = 0; i < total; i++) {
    const y = segH * i + segH / 2;
    const cx = i % 2 === 0 ? 8 : -8;
    const prevY = i === 0 ? 0 : segH * (i - 1) + segH / 2;
    const cp1x = i % 2 === 0 ? 4 : -4;
    const cp2x = i % 2 === 0 ? 4 : -4;
    d += ` C ${cp1x} ${prevY + (y - prevY) / 3}, ${cp2x} ${y - (y - prevY) / 3}, ${cx} ${y}`;
  }

  // Finish line
  d += ` C ${total % 2 === 0 ? -4 : 4} ${100 - segH / 3}, 0 ${100 - segH / 6}, 0 100`;

  const pathLen = 600;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      viewBox="-12 0 24 100"
      preserveAspectRatio="none"
    >
      {/* Ghost line */}
      <path
        d={d}
        stroke="rgba(197,160,57,0.12)"
        strokeWidth="1.2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {/* Active line */}
      <path
        ref={lineRef}
        d={d}
        stroke="url(#flowGold)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen * (1 - progress)}
        vectorEffect="non-scaling-stroke"
        style={{ transition: "stroke-dashoffset 0.08s linear" }}
      />
      <defs>
        <linearGradient id="flowGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,57,0)" />
          <stop offset="30%" stopColor="#C5A039" />
          <stop offset="70%" stopColor="#C5A039" />
          <stop offset="100%" stopColor="rgba(197,160,57,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
