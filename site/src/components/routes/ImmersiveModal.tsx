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
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ background: "var(--route-bg)" }}
        >
          {/* ── Top bar ── */}
          <div className="flex shrink-0 items-center justify-between border-b px-6 py-3"
            style={{ borderColor: "rgba(26,42,58,0.06)" }}
          >
            <span className="text-xs font-medium tracking-wider"
              style={{ color: "rgba(26,42,58,0.4)" }}>
              {routeTitle}
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors"
              style={{ color: "rgba(26,42,58,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--route-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,42,58,0.4)")}
            >
              ✕
            </button>
          </div>

          {/* ── Body: Sidebar + Content ── */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
            {/* ── Left Sidebar (fixed on desktop) ── */}
            <div className="border-b px-6 py-10 lg:h-full lg:w-[38%] lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r lg:px-10 lg:py-16"
              style={{ borderColor: "rgba(26,42,58,0.06)" }}
            >
              <div className="lg:sticky lg:top-16">
                {/* Label */}
                <p className="text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "rgba(26,42,58,0.3)" }}>
                  Memories of this place
                </p>

                {/* Clock */}
                <div className="mt-6" style={{ color: "var(--route-gold)" }}>
                  <ClockIcon />
                </div>

                {/* Stop identifier */}
                <p className="mt-6 font-mono text-xs tracking-wider"
                  style={{ color: "rgba(26,42,58,0.3)" }}>
                  {String(currentIndex + 1).padStart(2, "0")} / {String(allStops.length).padStart(2, "0")}
                </p>

                {/* Title */}
                <h2 className="mt-2 font-serif text-3xl leading-[1.12] md:text-4xl"
                  style={{ color: "var(--route-text)" }}>
                  {stop.stop}
                </h2>

                {/* Time + tags */}
                <p className="mt-4 font-mono text-xs tracking-wider"
                  style={{ color: "var(--route-gold)" }}>
                  {stop.time}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {stop.details.slice(0, 3).map((d, i) => (
                    <span key={i}
                      className="rounded-full px-2.5 py-1 text-[10px] leading-tight"
                      style={{
                        background: "var(--route-gold-light)",
                        color: "rgba(26,42,58,0.6)",
                      }}
                    >
                      {d.length > 30 ? d.slice(0, 28) + "…" : d}
                    </span>
                  ))}
                </div>

                {/* Prev / Next in sidebar */}
                <div className="mt-10 flex gap-3">
                  <button
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-opacity disabled:opacity-20"
                    style={{ color: "var(--route-gold)" }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-opacity disabled:opacity-20"
                    style={{ color: "var(--route-gold)" }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Scrolling Content (the ONLY scrollable area) ── */}
            <div className="flex-1 min-w-0 overflow-y-auto px-6 py-10 lg:px-14 lg:py-16">
              {/* Main story */}
              <div className="mx-auto max-w-2xl">
                {/* Hero image */}
                {stop.image && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10 overflow-hidden rounded-[1.5rem] shadow-[0_12px_40px_rgba(26,42,58,0.10)]"
                  >
                    <img
                      src={stop.image}
                      alt={stop.stop}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </motion.div>
                )}

                {/* Drop-cap story */}
                <div
                  className="drop-cap text-[15px] leading-[1.85]"
                  style={{ color: "rgba(26,42,58,0.75)" }}
                >
                  {paragraphs.map((para, i) => (
                    <p key={i} className="mb-5 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Schedule info if present */}
                {(stop.meal || stop.hotel || stop.transit) && (
                  <div className="mt-12 grid gap-4 sm:grid-cols-3">
                    {stop.meal && (
                      <div className="rounded-xl border px-4 py-4"
                        style={{ borderColor: "rgba(26,42,58,0.06)" }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: "rgba(26,42,58,0.3)" }}>
                          Meal
                        </p>
                        <p className="mt-1 text-sm"
                          style={{ color: "var(--route-text)" }}>
                          {stop.meal}
                        </p>
                      </div>
                    )}
                    {stop.hotel && (
                      <div className="rounded-xl border px-4 py-4"
                        style={{ borderColor: "rgba(26,42,58,0.06)" }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: "rgba(26,42,58,0.3)" }}>
                          Stay
                        </p>
                        <p className="mt-1 text-sm"
                          style={{ color: "var(--route-text)" }}>
                          {stop.hotel}
                        </p>
                      </div>
                    )}
                    {stop.transit && (
                      <div className="rounded-xl border px-4 py-4"
                        style={{ borderColor: "rgba(26,42,58,0.06)" }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: "rgba(26,42,58,0.3)" }}>
                          Transit
                        </p>
                        <p className="mt-1 text-sm"
                          style={{ color: "var(--route-text)" }}>
                          {stop.transit}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Discovery Route ── */}
                <div className="mt-16 border-t pt-12"
                  style={{ borderColor: "rgba(26,42,58,0.06)" }}
                >
                  <p className="text-[10px] uppercase tracking-[0.28em]"
                    style={{ color: "rgba(26,42,58,0.3)" }}>
                    Discovery Route
                  </p>
                  <h3 className="mt-2 font-serif text-2xl"
                    style={{ color: "var(--route-text)" }}>
                    Full Journey Timeline
                  </h3>

                  <div className="mt-8">
                    {allStops.map((s, i) => (
                      <DiscoveryItem
                        key={i}
                        stop={s}
                        index={i}
                        isActive={i === currentIndex}
                        onSelect={() => {
                          /* Within modal, can navigate via prev/next */
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom spacing */}
                <div className="h-20" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
