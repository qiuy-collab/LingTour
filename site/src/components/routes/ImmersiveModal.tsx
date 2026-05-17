"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
type Stop = {
  time: string;
  stop: string;
  story: string;
  details: string[];
  culturalStory: string;
  image?: string;
  meal?: string;
  hotel?: string;
  transit?: string;
};

type Props = {
  stop: Stop | undefined;
  routeTitle: string;
  isOpen: boolean;
  onClose: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  allStops: Stop[];
  currentIndex: number;
};

/* ─── Clock SVG ─── */
function ClockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className="clock-spin"
      style={{ color: "var(--route-gold)" }}
    >
      <circle
        cx="14"
        cy="14"
        r="12.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <line
        x1="14"
        y1="14"
        x2="14"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="14"
        x2="20"
        y2="14"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Discovery Route Item ─── */
function DiscoveryItem({
  stop,
  index,
  isActive,
  onSelect,
}: {
  stop: Stop;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`discovery-item flex cursor-pointer items-start gap-5 py-5 transition-opacity ${
        inView ? "opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 0.12}s` }}
      onClick={onSelect}
    >
      {/* Time */}
      <div className="w-14 shrink-0 pt-0.5 text-right">
        <span
          className="font-mono text-xs font-medium tracking-wider"
          style={{ color: "var(--route-gold)" }}
        >
          {stop.time}
        </span>
      </div>

      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: isActive ? "var(--route-gold)" : "rgba(26,42,58,0.12)",
            transition: "background 0.4s ease",
          }}
        />
        <div
          className="mt-0.5 h-12 w-px"
          style={{ background: "rgba(26,42,58,0.08)" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--route-text)" }}
        >
          {stop.stop}
        </p>
        <p
          className="mt-0.5 text-xs leading-relaxed"
          style={{ color: "rgba(26,42,58,0.45)" }}
        >
          {stop.story}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Modal ─── */
export function ImmersiveModal({
  stop,
  routeTitle,
  isOpen,
  onClose,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  allStops,
  currentIndex,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body + html scroll when open (prevent double scrollbar)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  if (!stop) return null;

  const paragraphs = stop.culturalStory.split("\n\n").filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-grain"
          style={{ background: "var(--background)" }}
        >
          {/* ── Top bar ── */}
          <div className="flex shrink-0 items-center justify-between border-b px-8 py-5 bg-white/40 backdrop-blur-md"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                Field Archive
              </span>
              <div className="h-px w-8 bg-[var(--line)]" />
              <span className="font-[family:var(--font-display)] text-sm italic text-[var(--river-deep)]">
                {routeTitle}
              </span>
            </div>
            <button
              onClick={onClose}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-sm transition-all hover:bg-[var(--cinnabar)] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* ── Body: Sidebar + Content ── */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
            {/* ── Left Sidebar (fixed on desktop) ── */}
            <div className="border-b px-8 py-12 lg:h-full lg:w-[40%] lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r lg:px-16 lg:py-20"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="lg:sticky lg:top-20">
                {/* Label */}
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)] handwritten">
                  Station Log / Observations
                </p>

                {/* Clock */}
                <div className="mt-8 flex items-center gap-4">
                  <ClockIcon />
                  <span className="font-mono text-sm font-bold text-[var(--river-deep)] tracking-tighter">
                    T-{stop.time}
                  </span>
                </div>

                {/* Stop identifier */}
                <div className="mt-10 flex items-baseline gap-3">
                  <span className="font-[family:var(--font-display)] text-6xl text-[var(--cinnabar)]/20">
                    {String(currentIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                    of {String(allStops.length).padStart(2, "0")} Registry Entries
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-6 font-[family:var(--font-display)] text-4xl leading-[1.1] md:text-5xl text-[var(--river-deep)]">
                  {stop.stop}
                </h2>

                <div className="mt-8 flex flex-wrap gap-2">
                  {stop.details.slice(0, 4).map((d, i) => (
                    <span key={i}
                      className="border border-[var(--gold)]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-white/50"
                    >
                      {d.length > 30 ? d.slice(0, 28) + "…" : d}
                    </span>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-16 flex items-center gap-8">
                  <button
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] disabled:opacity-20"
                  >
                    <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Previous
                  </button>
                  <div className="h-8 w-px bg-[var(--line)]" />
                  <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] disabled:opacity-20"
                  >
                    Next
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Scrolling Content ── */}
            <div className="flex-1 min-w-0 overflow-y-auto px-8 py-12 lg:px-20 lg:py-20 bg-white/20">
              <div className="mx-auto max-w-3xl">
                {/* Hero image as a physical photo */}
                {stop.image && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, rotate: 2 }}
                    animate={{ opacity: 1, y: 0, rotate: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 relative"
                  >
                    <div className="border-[12px] border-white bg-white scrapbook-shadow overflow-hidden">
                      <img
                        src={stop.image}
                        alt={stop.stop}
                        className="aspect-[16/10] w-full object-cover saturate-[0.9] contrast-[1.02]"
                      />
                    </div>
                    {/* Tape effect */}
                    <div className="absolute -top-4 left-1/4 z-20 h-10 w-32 -translate-x-1/2 -rotate-12 bg-white/40 backdrop-blur-[2px] border border-black/5" />
                    <div className="absolute -bottom-4 right-1/4 z-20 h-10 w-32 translate-x-1/2 rotate-6 bg-white/40 backdrop-blur-[2px] border border-black/5" />
                  </motion.div>
                )}

                {/* Story content */}
                <div className="relative">
                  <div className="absolute -left-12 top-0 text-7xl font-[family:var(--font-display)] text-[var(--gold)]/20 select-none">“</div>
                  <div className="drop-cap text-lg leading-relaxed text-[var(--ink)]/80">
                    {paragraphs.map((para, i) => (
                      <p key={i} className="mb-8 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Practical info as field notes */}
                {(stop.meal || stop.hotel || stop.transit) && (
                  <div className="mt-20 grid gap-6 sm:grid-cols-3">
                    {stop.meal && (
                      <div className="border-8 border-white bg-white p-6 scrapbook-shadow rotate-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-3">Provisioning</p>
                        <p className="text-sm text-[var(--river-deep)] font-medium">{stop.meal}</p>
                      </div>
                    )}
                    {stop.hotel && (
                      <div className="border-8 border-white bg-white p-6 scrapbook-shadow -rotate-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-3">Station / Stay</p>
                        <p className="text-sm text-[var(--river-deep)] font-medium">{stop.hotel}</p>
                      </div>
                    )}
                    {stop.transit && (
                      <div className="border-8 border-white bg-white p-6 scrapbook-shadow rotate-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-3">Transport</p>
                        <p className="text-sm text-[var(--river-deep)] font-medium">{stop.transit}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Timeline as a discovery archive */}
                <div className="mt-24 border-t border-[var(--line)] pt-16">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)] handwritten mb-4">
                    Full Journey Log
                  </p>
                  <h3 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] mb-10">
                    Temporal Mapping
                  </h3>

                  <div className="grid gap-2">
                    {allStops.map((s, i) => (
                      <DiscoveryItem
                        key={i}
                        stop={s}
                        index={i}
                        isActive={i === currentIndex}
                        onSelect={() => {}}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-32" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
