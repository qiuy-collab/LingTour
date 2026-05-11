"use client";

import { useEffect, useRef, useState } from "react";

export function InterpretingFlowLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPathLen(len);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;

    const update = () => {
      const steps = container.querySelectorAll<HTMLElement>("[data-flow-step]");
      const rect = container.getBoundingClientRect();
      const containerTop = rect.top;
      const containerHeight = rect.height;
      const viewportH = window.innerHeight;
      const scrollable = containerHeight - viewportH;
      if (scrollable <= 0) return;

      const scrolled = -containerTop;
      const rawProgress = Math.max(0, Math.min(1, scrolled / scrollable));
      // easeOutQuad
      const eased = 1 - (1 - rawProgress) * (1 - rawProgress);
      setProgress(eased);

      // Find active step
      let active = 0;
      steps.forEach((step, i) => {
        const sr = step.getBoundingClientRect();
        if (sr.top + sr.height * 0.4 < viewportH * 0.5) {
          active = i + 1;
        }
      });
      setActiveStep(Math.min(active, steps.length));

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* SVG flow line — absolute positioned, covers the container */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 200 600"
        >
          <defs>
            <linearGradient id="flowGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(197,160,57,0.08)" />
              <stop offset="15%" stopColor="rgba(197,160,57,0.6)" />
              <stop offset="50%" stopColor="#C5A039" />
              <stop offset="85%" stopColor="rgba(197,160,57,0.6)" />
              <stop offset="100%" stopColor="rgba(197,160,57,0.08)" />
            </linearGradient>
          </defs>

          {/* Ghost line */}
          <line
            x1="100" y1="0" x2="100" y2="600"
            stroke="rgba(197,160,57,0.1)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Active line — drawn as you scroll */}
          <path
            ref={pathRef}
            d="M 100 0 L 100 600"
            fill="none"
            stroke="url(#flowGold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={pathLen || 600}
            strokeDashoffset={(pathLen || 600) * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.15s linear" }}
          />

          {/* Step dots */}
          {[0, 1, 2, 3].map((i) => {
            const y = 50 + i * 166;
            const isActive = activeStep >= i + 1;
            return (
              <g key={i}>
                {/* Pulse ring for active */}
                {isActive && (
                  <circle
                    cx="100" cy={y} r="14"
                    fill="none"
                    stroke="rgba(197,160,57,0.3)"
                    strokeWidth="1"
                    className="interpreting-dot-pulse"
                  />
                )}
                {/* Dot */}
                <circle
                  cx="100" cy={y} r={isActive ? 6 : 4}
                  fill={isActive ? "#C5A039" : "rgba(197,160,57,0.2)"}
                  stroke={isActive ? "#C5A039" : "rgba(197,160,57,0.15)"}
                  strokeWidth="1.5"
                  style={{ transition: "all 0.4s ease" }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step cards — positioned around the flow line */}
      <div className="relative z-10 ml-[3rem] grid gap-16 sm:ml-[5rem] lg:ml-[7rem]">
        {[
          { step: "01", title: "Share the brief", body: "Tell us the city, date, group size, route interest, and whether the day is practical, cultural, or food-led." },
          { step: "02", title: "We shape the support", body: "We confirm language needs, pace, mobility, meeting point, and how much explanation versus logistics support you need." },
          { step: "03", title: "Receive the plan", body: "You receive service scope, timing, route fit, and the simplest working format for your day." },
          { step: "04", title: "Travel with support", body: "On the day itself, the interpreter handles communication while keeping the cultural thread clear and usable." },
        ].map((s, i) => {
          const isActive = activeStep >= i + 1;
          return (
            <div
              key={s.step}
              data-flow-step
              className={`group relative border-l-2 pl-6 transition-all duration-500 sm:pl-8 ${
                isActive
                  ? "border-[var(--gold)]"
                  : "border-[var(--line)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 font-[family:var(--font-display)] text-2xl tabular-nums transition-colors duration-500 ${
                    isActive ? "text-[var(--gold)]" : "text-[var(--muted)]"
                  }`}
                >
                  {s.step}
                </span>
                <div>
                  <h3
                    className={`font-[family:var(--font-display)] text-2xl leading-tight transition-colors duration-500 sm:text-3xl ${
                      isActive ? "text-[var(--river-deep)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
