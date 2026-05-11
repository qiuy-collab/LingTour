"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImmersiveModal } from "./ImmersiveModal";

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
  stops: Stop[];
  routeTitle: string;
  routeStory: string;
  routeImage: string;
};

function placeholderUri(text: string) {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='640' viewBox='0 0 900 640'>
        <rect width='900' height='640' fill='#F4F2EE'/>
        <text x='450' y='305' text-anchor='middle' fill='#C5A039' font-family='serif' font-size='28'>${safe}</text>
        <text x='450' y='348' text-anchor='middle' fill='#A8A397' font-family='sans-serif' font-size='12'>Route Stop</text>
      </svg>`,
    )
  );
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 980);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop;
}

/* ═══════════════════════════════════════════════════
   GOLDEN THREAD — bottom layer
   A subtle, long, flowing line under the editorial cards.
   It is intentionally decoration, not a visible timeline UI.
   ═══════════════════════════════════════════════════ */
function GoldenThread({ progress }: { progress: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        if (length > 0) {
          setPathLen(length);
          return;
        }
      }
      if (frame++ < 60) requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
  }, []);

  const safeProgress = Math.min(1, Math.max(0, progress));
  const offset = pathLen > 0 ? pathLen * (1 - safeProgress) : 9999;

  const d = [
    "M 44 0",
    "C 67 9, 75 17, 58 25",
    "C 34 36, 28 43, 48 51",
    "C 72 61, 70 70, 44 78",
    "C 21 85, 31 94, 56 100",
  ].join(" ");

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="routeThreadGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C5A039" stopOpacity="0" />
            <stop offset="12%" stopColor="#C5A039" stopOpacity="0.16" />
            <stop offset="38%" stopColor="#C5A039" stopOpacity="0.42" />
            <stop offset="62%" stopColor="#D4AF37" stopOpacity="0.36" />
            <stop offset="88%" stopColor="#C5A039" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C5A039" stopOpacity="0" />
          </linearGradient>
          <filter id="routeThreadGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={d}
          stroke="rgba(197,160,57,0.075)"
          strokeWidth="0.12"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={pathRef}
          d={d}
          stroke="url(#routeThreadGold)"
          strokeWidth="0.28"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#routeThreadGlow)"
          strokeDasharray={pathLen || 9999}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
    </div>
  );
}

function StopImage({ stop, index }: { stop: Stop; index: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.035 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <div
        style={{
          height: "100%",
          minHeight: index % 2 === 0 ? 430 : 340,
          overflow: "hidden",
          borderRadius: index % 2 === 0 ? "2rem" : "1.5rem",
          background: "rgba(197,160,57,0.06)",
          boxShadow: "0 18px 70px rgba(26,42,58,0.08)",
        }}
      >
        <img
          src={stop.image || placeholderUri(stop.stop)}
          alt={stop.stop}
          loading={index === 0 ? "eager" : "lazy"}
          onError={(e) => {
            const image = e.currentTarget;
            if (!image.dataset.fallback) {
              image.dataset.fallback = "1";
              image.src = placeholderUri(stop.stop);
            }
          }}
          style={{
            display: "block",
            height: "100%",
            width: "100%",
            objectFit: "cover",
            filter: "saturate(0.78) contrast(0.96)",
          }}
        />
      </div>
    </motion.div>
  );
}

function StopText({ stop, index, onEnterStory }: { stop: Stop; index: number; onEnterStory: () => void }) {
  return (
    <div
      style={{
        alignSelf: "center",
        padding: index % 2 === 0 ? "1rem 0" : "0.75rem 0",
      }}
    >
      <span
        style={{
          color: "var(--route-gold)",
          fontFamily: "monospace",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        Route Stop {String(index + 1).padStart(2, "0")}
      </span>

      <h3
        style={{
          marginTop: 14,
          maxWidth: 460,
          color: "var(--route-text)",
          fontFamily: "Georgia, serif",
          fontSize: index % 2 === 0 ? "clamp(2.1rem, 4vw, 4.8rem)" : "clamp(1.75rem, 3vw, 3.6rem)",
          lineHeight: 0.95,
          letterSpacing: "-0.045em",
        }}
      >
        {stop.stop}
      </h3>

      <p
        style={{
          marginTop: 22,
          maxWidth: 440,
          color: "rgba(26,42,58,0.56)",
          fontFamily: "Georgia, serif",
          fontSize: 17,
          fontStyle: "italic",
          lineHeight: 1.75,
        }}
      >
        {stop.story}
      </p>

      {stop.details.length > 0 && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, maxWidth: 430 }}>
          {stop.details.slice(0, 3).map((detail, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span
                style={{
                  marginTop: 8,
                  height: 5,
                  width: 5,
                  flex: "0 0 5px",
                  borderRadius: "999px",
                  background: "var(--route-gold)",
                  opacity: 0.7,
                }}
              />
              <span style={{ color: "rgba(26,42,58,0.58)", fontSize: 13, lineHeight: 1.7 }}>
                {detail}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onEnterStory}
        style={{
          marginTop: 30,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          color: "var(--route-gold)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ height: 1, width: 28, background: "var(--route-gold)" }} />
        Enter the story
      </button>
    </div>
  );
}

function StopCard({
  stop,
  index,
  isActive,
  onEnterStory,
  cardRef,
  isDesktop,
}: {
  stop: Stop;
  index: number;
  isActive: boolean;
  onEnterStory: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
  isDesktop: boolean;
}) {
  const even = index % 2 === 0;
  const featured = index === 0 || index === 2;

  const image = <StopImage stop={stop} index={index} />;
  const text = <StopText stop={stop} index={index} onEnterStory={onEnterStory} />;

  return (
    <motion.article
      ref={cardRef}
      data-stop={index}
      data-layout={even ? "image-left" : "text-left"}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        zIndex: 10,
        width: isDesktop ? (featured ? "82%" : "68%") : "100%",
        marginLeft: isDesktop ? (even ? "0" : "auto") : "0",
        marginRight: isDesktop ? (even ? "auto" : "0") : "0",
        transform: isDesktop
          ? featured
            ? "translateY(0)"
            : even
              ? "translateY(-24px)"
              : "translateY(36px)"
          : "none",
        borderRadius: featured ? "2.25rem" : "1.75rem",
        background: "rgba(244,242,238,0.965)",
        boxShadow: isActive
          ? "0 30px 90px rgba(26,42,58,0.13)"
          : "0 18px 70px rgba(26,42,58,0.075)",
        border: "1px solid rgba(197,160,57,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: isDesktop ? "grid" : "block",
          gridTemplateColumns: isDesktop
            ? featured
              ? "minmax(0, 1.18fr) minmax(0, 0.82fr)"
              : "minmax(0, 0.92fr) minmax(0, 1.08fr)"
            : undefined,
          gap: isDesktop ? (featured ? 54 : 42) : 0,
          alignItems: "center",
          padding: isDesktop ? (featured ? 34 : 28) : 20,
        }}
      >
        {isDesktop ? (
          even ? (
            <>
              {image}
              {text}
            </>
          ) : (
            <>
              {text}
              {image}
            </>
          )
        ) : (
          <>
            {image}
            <div style={{ paddingTop: 24 }}>{text}</div>
          </>
        )}
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════
   SCROLL STORY ROUTE — B version
   Magazine stagger: larger 1/3 cards, lighter 2/4 cards.
   Golden thread stays underneath and only peeks through gaps.
   ═══════════════════════════════════════════════════ */
export function ScrollStoryRoute({ stops, routeTitle, routeStory }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(0);
  const isDesktop = useDesktopLayout();

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el;
  }, []);

  useEffect(() => {
    const observers = cardRefs.current.filter(Boolean).map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(i);
        },
        { threshold: 0.42 },
      );
      obs.observe(ref!);
      return obs;
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [stops.length, isDesktop]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        setScrollProgress(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalProgress = stops.length > 0 ? Math.min(1, (activeIdx + scrollProgress) / stops.length) : 0;

  return (
    <>
      <section ref={rootRef} className="relative" style={{ background: "var(--route-bg)" }}>
        <div
          className="sticky top-0 z-40 border-b backdrop-blur-sm"
          style={{
            background: "rgba(244,242,238,0.94)",
            borderColor: "rgba(26,42,58,0.04)",
          }}
        >
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-2.5">
            <span
              className="font-mono text-[11px] font-medium tracking-[0.18em]"
              style={{ color: "var(--route-gold)" }}
            >
              {String(activeIdx + 1).padStart(2, "0")}/{String(stops.length).padStart(2, "0")}
            </span>
            <span className="hidden font-serif text-sm italic sm:inline" style={{ color: "var(--route-text)" }}>
              {stops[activeIdx]?.stop || ""}
            </span>
            <div className="flex-1">
              <div className="h-px w-full rounded-full" style={{ background: "rgba(26,42,58,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(totalProgress * 100)}%`, background: "var(--route-gold)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 py-20 text-center lg:py-28">
          <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--route-gold)" }}>
            Route Narrative
          </p>
          <div className="mx-auto mt-3 h-px w-10" style={{ background: "var(--route-gold)" }} />
          <p
            className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed italic md:text-xl"
            style={{ color: "rgba(26,42,58,0.48)" }}
          >
            &ldquo;{routeStory}&rdquo;
          </p>
        </div>

        <div className="relative pb-28 lg:pb-40">
          <GoldenThread progress={scrollProgress} />

          <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
            <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? 168 : 72 }}>
              {stops.map((stop, i) => (
                <StopCard
                  key={`${stop.time}-${stop.stop}`}
                  stop={stop}
                  index={i}
                  isActive={i === activeIdx}
                  isDesktop={isDesktop}
                  onEnterStory={() => {
                    setSelectedStop(i);
                    setModalOpen(true);
                  }}
                  cardRef={(el) => setCardRef(el, i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <ImmersiveModal
            stop={stops[selectedStop]}
            routeTitle={routeTitle}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            hasPrev={selectedStop > 0}
            hasNext={selectedStop < stops.length - 1}
            onPrev={() => setSelectedStop((prev) => Math.max(0, prev - 1))}
            onNext={() => setSelectedStop((prev) => Math.min(stops.length - 1, prev + 1))}
            allStops={stops}
            currentIndex={selectedStop}
          />
        )}
      </AnimatePresence>
    </>
  );
}
