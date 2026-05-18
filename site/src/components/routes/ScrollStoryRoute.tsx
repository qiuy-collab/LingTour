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
        <rect width='900' height='640' fill='#eeebe5'/>
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
      whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 0.5 : -0.5 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div
        className={`relative h-full min-h-[400px] overflow-hidden border-[10px] border-white bg-white scrapbook-shadow transition-transform duration-700 ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
      >
        <img
          src={stop.image || placeholderUri(stop.stop)}
          alt={stop.stop}
          loading={index === 0 ? "eager" : "lazy"}
          className="block h-full w-full object-cover saturate-[0.85] contrast-[0.98] transition-transform duration-[10s] hover:scale-110"
        />
        {/* Physical tape effect */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-[2px] border border-black/5 ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'} z-10`} />
      </div>
    </motion.div>
  );
}

function StopText({ stop, index, onEnterStory }: { stop: Stop; index: number; onEnterStory: () => void }) {
  return (
    <div className={`flex flex-col ${index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'} py-8`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)] handwritten">
        Field Entry No. {String(index + 1).padStart(2, "0")}
      </span>

      <h3 className="mt-6 font-[family:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-[var(--river-deep)] md:text-5xl lg:text-6xl">
        {stop.stop}
      </h3>

      <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--muted)] italic handwritten">
        &ldquo;{stop.story}&rdquo;
      </p>

      {stop.details.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {stop.details.slice(0, 3).map((detail, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]/60" />
              <span className="text-sm leading-relaxed text-[var(--muted)]">
                {detail}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onEnterStory}
        className="mt-10 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)] transition-all hover:text-[var(--cinnabar)] hover:translate-x-2"
      >
        <div className="h-px w-10 bg-[var(--gold)] transition-all group-hover:w-16" />
        <span>Open Archive</span>
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

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-10 w-full transition-all duration-500 ${
        isDesktop
          ? even
            ? "max-w-[85%] mr-auto"
            : "max-w-[85%] ml-auto mt-[-40px]"
          : ""
      }`}
    >
      <div className={`grid gap-12 items-center p-6 lg:p-12 ${isDesktop ? (even ? 'grid-cols-[1.1fr_0.9fr]' : 'grid-cols-[0.9fr_1.1fr]') : 'grid-cols-1'}`}>
        {isDesktop ? (
          even ? (
            <>
              <StopImage stop={stop} index={index} />
              <StopText stop={stop} index={index} onEnterStory={onEnterStory} />
            </>
          ) : (
            <>
              <StopText stop={stop} index={index} onEnterStory={onEnterStory} />
              <StopImage stop={stop} index={index} />
            </>
          )
        ) : (
          <>
            <StopImage stop={stop} index={index} />
            <StopText stop={stop} index={index} onEnterStory={onEnterStory} />
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
      <section ref={rootRef} className="relative bg-grain" style={{ background: "var(--background)" }}>
        <div
          className="sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur-md"
          style={{
            background: "rgba(232,222,208,0.85)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
            <span
              className="font-mono text-xs font-bold tracking-[0.2em] text-[var(--cinnabar)]"
            >
              {String(activeIdx + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}
            </span>
            <span className="hidden font-[family:var(--font-display)] text-base italic text-[var(--river-deep)] sm:inline">
              {stops[activeIdx]?.stop || ""}
            </span>
            <div className="flex-1">
              <div className="h-1 w-full rounded-full bg-[var(--line)]">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-[var(--gold)]"
                  style={{ width: `${Math.round(totalProgress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 py-24 text-center lg:py-32">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
            Route Narrative / Field Log
          </p>
          <div className="mx-auto mt-6 h-px w-16 bg-[var(--gold)]/40" />
          <p
            className="mx-auto mt-10 max-w-2xl font-[family:var(--font-display)] text-2xl leading-relaxed italic text-[var(--river-deep)] md:text-3xl"
          >
            &ldquo;{routeStory}&rdquo;
          </p>
        </div>

        <div className="relative pb-32 lg:pb-48">
          <GoldenThread progress={scrollProgress} />

          <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-20">
            <div className="flex flex-col gap-24 lg:gap-40">
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
