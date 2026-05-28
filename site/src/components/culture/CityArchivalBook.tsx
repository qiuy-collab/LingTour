"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CityCultureSection } from "@/data/culture";

type Props = {
  cityName: string;
  sections: CityCultureSection[];
  fallbackImage: string;
  showIntro?: boolean;
  immersive?: boolean;
};

type FlipState = {
  from: number;
  to: number;
  direction: "next" | "prev";
  key: number;
};

const BOOKMARK_COLORS = [
  "linear-gradient(180deg, #b64235, #7b2e2a)",
  "linear-gradient(180deg, #c5a039, #8b6f22)",
  "linear-gradient(180deg, #17495a, #0f303c)",
  "linear-gradient(180deg, #8d7358, #5d4b3a)",
  "linear-gradient(180deg, #6f8e97, #365966)",
  "linear-gradient(180deg, #a45a3b, #6b341f)",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

function sectionFrames(
  section: CityCultureSection,
  fallbackImage: string,
): string[] {
  return Array.from(
    new Set(
      [section.image, ...(section.images ?? []), section.breathImage, fallbackImage].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
}

function splitLeadParagraph(paragraph: string) {
  const trimmed = paragraph.trim();
  if (!trimmed) {
    return { initial: "", rest: "" };
  }

  return {
    initial: trimmed.slice(0, 1),
    rest: trimmed.slice(1).trimStart(),
  };
}

function archivalMetadata(index: number, activeFrame: number, frameCount: number) {
  return [
    "ISO 400",
    "35mm",
    "REC_DATE 2026",
    `PLATE ${String(index + 1).padStart(2, "0")}`,
    `FRAME ${String(activeFrame + 1).padStart(2, "0")}/${String(frameCount).padStart(2, "0")}`,
  ].join(" · ");
}

function sectionHeightWeight(
  section: CityCultureSection,
  fallbackImage: string,
) {
  const paragraphs = section.body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const frameCount = sectionFrames(section, fallbackImage).length;
  const bodyLength = paragraphs.join(" ").length;
  const quoteLength = section.breathQuote?.trim().length ?? 0;

  return (
    bodyLength +
    quoteLength * 0.9 +
    paragraphs.length * 180 +
    Math.max(frameCount - 1, 0) * 130 +
    (section.stat ? 120 : 0)
  );
}

function uniformBookHeightClass(
  sections: CityCultureSection[],
  fallbackImage: string,
  immersive?: boolean,
) {
  const heaviestSection = sections.reduce((maxWeight, section) => {
    return Math.max(maxWeight, sectionHeightWeight(section, fallbackImage));
  }, 0);

  if (immersive) {
    if (heaviestSection >= 2600) return "min-h-[70rem]";
    if (heaviestSection >= 1800) return "min-h-[62rem]";
    if (heaviestSection >= 1200) return "min-h-[56rem]";
    return "min-h-[50rem]";
  }

  if (heaviestSection >= 2200) return "min-h-[52rem]";
  if (heaviestSection >= 1400) return "min-h-[46rem]";
  return "min-h-[40rem]";
}

function VisualPlate({
  section,
  index,
  fallbackImage,
  cityName,
}: {
  section: CityCultureSection;
  index: number;
  fallbackImage: string;
  cityName: string;
}) {
  const frames = useMemo(
    () => sectionFrames(section, fallbackImage),
    [fallbackImage, section],
  );
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    setActiveFrame(0);
  }, [section.title]);

  const image = frames[activeFrame] || section.image || fallbackImage;
  const frameCount = frames.length;
  const detailImage =
    section.breathImage && section.breathImage !== image
      ? section.breathImage
      : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[var(--parchment)] bg-grain px-4 py-5 lg:px-7 lg:py-8">
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/[0.08] to-transparent" />
      <div className="absolute left-10 top-5 h-8 w-28 -rotate-2 border border-black/5 bg-white/30 backdrop-blur-[2px]" />

      <div className="relative z-10 flex items-center justify-between">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
          {cityName} / Plate
        </p>
        <span className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Chapter {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 mt-6 flex flex-1 items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_6.25rem] lg:items-start">
          <div className="min-w-0">
            <div className="relative w-full max-w-[31rem] rotate-[-1.2deg] border-[6px] lg:border-[12px] border-white bg-white scrapbook-shadow transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1.8deg]">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image}
                  alt={section.title}
                  className="h-full w-full object-cover saturate-[0.88] contrast-[0.98]"
                  loading="eager"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
              </div>
              {detailImage ? (
                <div className="absolute -bottom-8 right-5 w-28 rotate-[5deg] border-[8px] border-white bg-white shadow-[0_16px_32px_rgba(17,25,35,0.16)] lg:w-32">
                  <div className="absolute -top-3 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-[3deg] border border-black/5 bg-[rgba(244,236,220,0.76)] backdrop-blur-[2px]" />
                  <img
                    src={detailImage}
                    alt=""
                    aria-hidden="true"
                    className="aspect-[4/5] w-full object-cover saturate-[0.78] sepia-[0.06]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="border-t border-black/5 px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                      detail frame
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="border-t border-black/5 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {archivalMetadata(index, activeFrame, frameCount)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-2">
                <p className="min-w-0 truncate text-left text-base text-[var(--river-deep)] handwritten">
                  {section.title}
                </p>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Plate {String(activeFrame + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {frameCount > 1 ? (
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
              {frames.map((frame, frameIndex) => {
                const isActive = frameIndex === activeFrame;
                return (
                  <button
                    key={`${section.title}-frame-${frameIndex}`}
                    type="button"
                    onClick={() => setActiveFrame(frameIndex)}
                    className={`group relative overflow-hidden border-[6px] bg-white text-left scrapbook-shadow transition ${
                      isActive
                        ? "border-[var(--gold)] scale-[1.02]"
                        : "border-white hover:-translate-y-1 hover:border-[var(--line)]"
                    } ${frameIndex % 2 === 0 ? "rotate-[1.6deg]" : "-rotate-[1.4deg]"}`}
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={frame}
                        alt={`${section.title} frame ${frameIndex + 1}`}
                        className={`h-full w-full object-cover transition duration-500 ${
                          isActive
                            ? "saturate-100 contrast-100"
                            : "saturate-[0.72] contrast-[0.96] group-hover:saturate-[0.9]"
                        }`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="border-t border-black/5 px-2.5 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--river-deep)]/72">
                        {String(frameIndex + 1).padStart(2, "0")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NarrativePage({
  section,
  index,
  total,
  cityName,
}: {
  section: CityCultureSection;
  index: number;
  total: number;
  cityName: string;
}) {
  const paragraphs = section.body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const leadParagraph = paragraphs[0] ?? "";
  const bodyParagraphs = paragraphs.slice(1);
  const lead = splitLeadParagraph(leadParagraph);
  const compactLayout =
    bodyParagraphs.length === 0 &&
    (leadParagraph.length < 260 || sectionHeightWeight(section, section.image) < 900);
  const pageBodyClass = section.breathQuote
    ? "justify-between"
    : "justify-start";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[var(--parchment-light)] bg-grain px-7 py-8 lg:px-9">
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/[0.08] to-transparent" />
      <div className="absolute right-8 top-8 h-16 w-7 rotate-12 bg-[var(--bookmark-tape)]/80 shadow-md [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]" />

      <div className="relative z-10 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
            {cityName} Archive
          </span>
          <span className="-rotate-2 border-2 border-[var(--cinnabar)]/55 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)]">
            Chapter {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-6 font-[family:var(--font-display)] text-3xl leading-[1.05] tracking-tight text-[var(--river-deep)] xl:text-4xl">
          {section.title}
        </h3>
        {section.stat ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
            {section.stat}
          </p>
        ) : null}
      </div>

      <div className={`relative z-10 mt-4 flex flex-1 flex-col ${pageBodyClass}`}>
        <div
          className={`space-y-6 pr-1 ${
            compactLayout ? "mx-auto max-w-[40rem]" : ""
          }`}
        >
          <div className="space-y-5">
            {leadParagraph ? (
              <p className="text-[17px] leading-[1.9] text-[var(--river-deep)]">
                <span className="float-left mr-3 pt-1 font-[family:var(--font-display)] text-6xl leading-[0.82] text-[var(--cinnabar)] lg:text-7xl">
                  {lead.initial}
                </span>
                <span className="handwritten">{lead.rest}</span>
              </p>
            ) : null}

            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <div key={`${index}-${section.title}-p-${paragraphIndex}`} className="space-y-4">
                <div className="h-px w-14 bg-[var(--gold)]/65" />
                <p className="text-base leading-7 text-[var(--muted)]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {section.breathQuote ? (
            <blockquote className="mx-auto mt-2 max-w-[30rem] rounded-[1.5rem] border border-[var(--gold)]/35 bg-white/25 px-5 py-5 shadow-[0_14px_34px_rgba(17,25,35,0.06)] backdrop-blur-[1px] lg:px-6 lg:py-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-12 w-px shrink-0 bg-[var(--cinnabar)]/45" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--cinnabar)]">
                    Pull quote
                  </p>
                  <p className="mt-3 font-[family:var(--font-display)] text-[1.4rem] italic leading-[1.58] tracking-[-0.01em] text-[var(--river-deep)]/84 lg:text-[1.55rem]">
                    &ldquo;{section.breathQuote}&rdquo;
                  </p>
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--muted)]">
                    Field Voice / {cityName}
                  </p>
                </div>
              </div>
            </blockquote>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PageBack({ section, index }: { section: CityCultureSection; index: number }) {
  return (
    <div className="relative h-full overflow-hidden bg-[var(--parchment-deep)] bg-grain px-8 py-10">
      <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/[0.07] to-transparent" />
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
        Turning Chapter
      </p>
      <h4 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)]">
        {section.title}
      </h4>
      <div className="absolute bottom-10 left-8 right-8 border-t border-dashed border-[var(--line)] pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Chapter / {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}

function TurningLeaf({
  cityName,
  direction,
}: {
  cityName: string;
  direction: "next" | "prev";
}) {
  return (
    <div className="relative h-full overflow-hidden bg-[var(--parchment-warm)] bg-grain">
      <div
        className={`absolute inset-y-0 top-0 w-16 ${
          direction === "next"
            ? "right-0 bg-[linear-gradient(270deg,rgba(17,25,35,0.22),rgba(17,25,35,0.08)_35%,transparent)]"
            : "left-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.22),rgba(17,25,35,0.08)_35%,transparent)]"
        }`}
      />
      <div
        className={`absolute inset-y-0 top-0 w-10 ${
          direction === "next"
            ? "left-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.45),transparent)]"
            : "right-0 bg-[linear-gradient(270deg,rgba(255,255,255,0.45),transparent)]"
        }`}
      />
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,transparent,rgba(17,25,35,0.07))]" />

      <div className="absolute left-8 top-8 h-8 w-28 -rotate-2 border border-black/5 bg-white/30 backdrop-blur-[2px]" />
      <div className="absolute right-8 top-10 h-14 w-6 rotate-12 bg-[var(--bookmark-tape)]/78 shadow-md [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between px-8 py-10">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-[var(--cinnabar)]">
            {cityName} Archive
          </p>
          <div className="mt-10 space-y-5 opacity-45">
            <div className="h-px w-3/4 bg-[var(--line)]" />
            <div className="h-px w-5/6 bg-[var(--line)]" />
            <div className="h-px w-2/3 bg-[var(--line)]" />
            <div className="h-px w-4/5 bg-[var(--line)]" />
            <div className="h-px w-1/2 bg-[var(--line)]" />
          </div>
        </div>

        <div className="border-t border-dashed border-[var(--line)] pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
            Turning page
          </p>
        </div>
      </div>
    </div>
  );
}

function Bookmarks({
  sections,
  activeIdx,
  onSelect,
}: {
  sections: CityCultureSection[];
  activeIdx: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="absolute -right-6 top-20 z-30 hidden flex-col gap-2 lg:flex">
      {sections.map((section, index) => {
        const isActive = index === activeIdx;
        return (
          <button
            key={`${index}-${section.title}`}
            type="button"
            aria-label={`Turn to ${section.title}`}
            onClick={() => onSelect(index)}
            className="group relative h-12 w-10 origin-left text-left transition duration-300 hover:translate-x-1"
            style={{ transform: `translateX(${isActive ? "8px" : "0"})` }}
          >
            <span
              className="absolute inset-y-0 left-0 w-10 rounded-r-sm shadow-[0_8px_18px_rgba(17,25,35,0.16)] transition-opacity duration-300"
              style={{
                background: BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
                opacity: isActive ? 0.96 : 0.72,
              }}
            />
            <span className="absolute inset-y-1 left-2 w-px bg-white/30" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-white">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="pointer-events-none absolute left-12 top-1/2 hidden -translate-y-1/2 whitespace-nowrap border border-[var(--line)] bg-[var(--paper)]/96 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--river-deep)] shadow-lg group-hover:block">
              {section.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BookSpread({
  sections,
  activeIdx,
  flipState,
  fallbackImage,
  cityName,
  onSelectSection,
  onPrevPage,
  onNextPage,
  widthClass,
  heightClass,
  minHeightPx,
  immersive,
}: {
  sections: CityCultureSection[];
  activeIdx: number;
  flipState: FlipState | null;
  fallbackImage: string;
  cityName: string;
  onSelectSection: (index: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  widthClass: string;
  heightClass: string;
  minHeightPx?: number | null;
  immersive?: boolean;
}) {
  const visibleIdx = flipState?.to ?? activeIdx;
  const activeSection = sections[visibleIdx];
  const canGoPrev = activeIdx > 0;
  const canGoNext = activeIdx < sections.length - 1;

  return (
    <div
      className={`relative mx-auto ${widthClass} ${heightClass}`}
      style={{
        perspective: "1500px",
        ...(minHeightPx ? { height: `${Math.ceil(minHeightPx)}px`, minHeight: "auto" } : {}),
      }}
    >
      <div className="absolute inset-x-8 -bottom-5 h-8 bg-black/10 blur-2xl" />
      <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[var(--line)] bg-[var(--parchment-stack-1)]" />
      <div className="absolute inset-0 translate-x-2 translate-y-2 border border-[var(--line)] bg-[var(--parchment-stack-2)]" />
      <div className="absolute inset-0 border border-[var(--line)] bg-[var(--parchment-page)] shadow-[0_42px_110px_rgba(17,25,35,0.22)]" />

      <div className="relative grid h-full grid-cols-2 overflow-visible">
        <div className="relative overflow-hidden border-r border-black/10 text-left">
          <VisualPlate
            section={activeSection}
            index={visibleIdx}
            fallbackImage={fallbackImage}
            cityName={cityName}
          />
        </div>

        <div className="relative overflow-hidden text-left">
          <NarrativePage
            section={activeSection}
            index={visibleIdx}
            total={sections.length}
            cityName={cityName}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (canGoPrev && !flipState) onPrevPage();
          }}
          aria-disabled={!canGoPrev || Boolean(flipState)}
          aria-label="Turn to previous chapter"
          className={`absolute inset-y-0 left-0 z-20 w-14 bg-transparent ${
            canGoPrev ? "cursor-pointer" : "cursor-default"
          }`}
        />
        <button
          type="button"
          onClick={() => {
            if (canGoNext && !flipState) onNextPage();
          }}
          aria-disabled={!canGoNext || Boolean(flipState)}
          aria-label="Turn to next chapter"
          className={`absolute inset-y-0 right-0 z-20 w-14 bg-transparent ${
            canGoNext ? "cursor-pointer" : "cursor-default"
          }`}
        />

        <AnimatePresence>
          {flipState ? (
            <motion.div
              key={flipState.key}
              className={`absolute top-0 z-20 h-full w-1/2 ${
                flipState.direction === "next" ? "right-0 origin-left" : "left-0 origin-right"
              }`}
              initial={{
                rotateY: 0,
                skewY: 0,
                x: 0,
                scaleY: 1,
                scaleX: 1,
              }}
              animate={{
                rotateY: flipState.direction === "next" ? -168 : 168,
                skewY: flipState.direction === "next" ? -2.8 : 2.8,
                x: flipState.direction === "next" ? -10 : 10,
                scaleY: 0.992,
                scaleX: 0.985,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 0.7, 0.2, 1] }}
              style={{
                transformStyle: "preserve-3d",
                boxShadow:
                  flipState.direction === "next"
                    ? "-54px 0 92px rgba(17,25,35,0.22)"
                    : "54px 0 92px rgba(17,25,35,0.22)",
                filter: "drop-shadow(0 18px 30px rgba(17,25,35,0.12))",
              }}
            >
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
                <TurningLeaf cityName={cityName} direction={flipState.direction} />
              </div>
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                <PageBack section={sections[flipState.to]} index={flipState.to} />
                <div
                  className={`pointer-events-none absolute inset-y-0 top-0 w-14 ${
                    flipState.direction === "next"
                      ? "left-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.52),transparent)]"
                      : "right-0 bg-[linear-gradient(270deg,rgba(255,255,255,0.52),transparent)]"
                  }`}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(17,25,35,0.08))]" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-full w-10 -translate-x-1/2">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--river-deep)]/35" />
          <div className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(17,25,35,0.24),rgba(17,25,35,0.08)_34%,transparent_70%)]" />
          <div className="absolute inset-y-8 left-1/2 w-1 -translate-x-1/2 rounded-full bg-white/25 blur-[1px]" />
        </div>
      </div>

      <Bookmarks sections={sections} activeIdx={visibleIdx} onSelect={onSelectSection} />
    </div>
  );
}

function MobileStack({
  sections,
  activeIdx,
  fallbackImage,
  cityName,
  onSelectSection,
  setMobileRef,
}: {
  sections: CityCultureSection[];
  activeIdx: number;
  fallbackImage: string;
  cityName: string;
  onSelectSection: (index: number) => void;
  setMobileRef: (node: HTMLElement | null, index: number) => void;
}) {
  return (
    <div className="lg:hidden">
      <div className="sticky top-16 z-30 border-y border-[var(--line)] bg-[var(--paper-deep)]/92 bg-grain px-4 py-3 backdrop-blur">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {sections.map((section, index) => (
            <button
              key={`${index}-${section.title}-mobile-tab`}
              type="button"
              onClick={() => onSelectSection(index)}
              className={`shrink-0 border px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] transition ${
                index === activeIdx
                  ? "border-[var(--cinnabar)] bg-[var(--cinnabar)] text-white"
                  : "border-[var(--line)] bg-[var(--parchment-tab)] text-[var(--river-deep)]"
              }`}
            >
              {String(index + 1).padStart(2, "0")} <span className="ml-1 hidden sm:inline">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="site-container py-12">
        <div className="grid gap-12">
          {sections.map((section, index) => (
            <article
              key={`${index}-${section.title}-mobile`}
              ref={(node) => setMobileRef(node, index)}
              className="border border-[var(--line)] bg-[var(--parchment-page)] bg-grain shadow-[0_22px_60px_rgba(17,25,35,0.14)]"
            >
              <VisualPlate
                section={section}
                index={index}
                fallbackImage={fallbackImage}
                cityName={cityName}
              />
              <NarrativePage
                section={section}
                index={index}
                total={sections.length}
                cityName={cityName}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CityArchivalBook({
  cityName,
  sections,
  fallbackImage,
  showIntro = true,
  immersive = false,
}: Props) {
  const mobileRefs = useRef<(HTMLElement | null)[]>([]);
  const measurementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flipTimerRef = useRef<number | null>(null);
  const desktopActiveIdxRef = useRef(0);
  const [desktopActiveIdx, setDesktopActiveIdx] = useState(0);
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const [measuredBookHeight, setMeasuredBookHeight] = useState<number | null>(null);
  const isDesktop = useDesktopLayout();
  const activeIdx = isDesktop ? (flipState?.to ?? desktopActiveIdx) : mobileActiveIdx;
  const widthClass = immersive
    ? "w-[min(92rem,calc(100vw-3rem))]"
    : "w-[min(78rem,calc(100vw-8rem))]";
  const desktopHeightClass = useMemo(
    () => uniformBookHeightClass(sections, fallbackImage, immersive),
    [fallbackImage, immersive, sections],
  );

  const turnDesktopPage = useCallback(
    (target: number | ((currentIndex: number) => number)) => {
      const currentIndex = desktopActiveIdxRef.current;
      const rawTarget = typeof target === "function" ? target(currentIndex) : target;
      const safeTarget = clamp(rawTarget, 0, Math.max(sections.length - 1, 0));
      if (safeTarget === currentIndex) return;

      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }

      setFlipState({
        from: currentIndex,
        to: safeTarget,
        direction: safeTarget > currentIndex ? "next" : "prev",
        key: Date.now(),
      });
      flipTimerRef.current = window.setTimeout(() => {
        desktopActiveIdxRef.current = safeTarget;
        setDesktopActiveIdx(safeTarget);
        setFlipState(null);
      }, 860);
    },
    [sections.length],
  );

  const selectSection = useCallback(
    (index: number) => {
      if (isDesktop) {
        turnDesktopPage(index);
        return;
      }
      setMobileActiveIdx(index);
      mobileRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [isDesktop, turnDesktopPage],
  );

  const turnPrev = useCallback(() => turnDesktopPage((currentIndex) => currentIndex - 1), [turnDesktopPage]);
  const turnNext = useCallback(() => turnDesktopPage((currentIndex) => currentIndex + 1), [turnDesktopPage]);

  const setMobileRef = useCallback((node: HTMLElement | null, index: number) => {
    mobileRefs.current[index] = node;
  }, []);

  const setMeasurementRef = useCallback((node: HTMLDivElement | null, index: number) => {
    measurementRefs.current[index] = node;
  }, []);

  useEffect(() => {
    desktopActiveIdxRef.current = desktopActiveIdx;
  }, [desktopActiveIdx]);

  useEffect(() => {
    setMeasuredBookHeight(null);
  }, [fallbackImage, immersive, sections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sources = sections
      .flatMap((section) => [section.image, section.breathImage, fallbackImage])
      .filter((src): src is string => Boolean(src));
    const unique = Array.from(new Set(sources));
    unique.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [sections, fallbackImage]);

  useEffect(() => {
    if (isDesktop) return;
    const observers = mobileRefs.current.flatMap((ref, index) => {
      if (!ref) return [];
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setMobileActiveIdx(index);
        },
        { threshold: 0.35, rootMargin: "-20% 0px -45% 0px" },
      );
      observer.observe(ref);
      return [observer];
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [isDesktop, sections.length]);

  useEffect(() => {
    if (!isDesktop) return;

    const nodes = measurementRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node),
    );
    if (!nodes.length) return;

    const updateHeight = () => {
      const nextHeight = nodes.reduce((maxHeight, node) => {
        return Math.max(maxHeight, node.getBoundingClientRect().height);
      }, 0);

      if (nextHeight > 0) {
        setMeasuredBookHeight((current) => {
          const rounded = Math.ceil(nextHeight);
          // Only update if significantly different to avoid minor layout thrashing,
          // but always ensure we take the largest possible height.
          return Math.max(current ?? 0, rounded);
        });
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    nodes.forEach((node) => resizeObserver.observe(node));
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [fallbackImage, isDesktop, sections]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    };
  }, []);

  if (sections.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[var(--paper-deep)] bg-grain">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(197,160,57,0.13),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(23,73,90,0.09),transparent_30%)]" />

      {showIntro ? (
        <div className="relative z-10 py-16 text-center lg:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
            Archival Book / {cityName}
          </p>
          <div className="mx-auto mt-6 h-px w-16 bg-[var(--gold)]/45" />
          <h2 className="mx-auto mt-9 max-w-3xl font-[family:var(--font-display)] text-3xl leading-[1.1] text-[var(--river-deep)] md:text-5xl">
            Reading <span className="italic text-[var(--gold)]">{cityName}</span>.
          </h2>
        </div>
      ) : null}

      {showIntro ? (
        <div className="pointer-events-none absolute left-1/2 top-5 z-40 hidden w-[min(76rem,calc(100%-4rem))] -translate-x-1/2 items-center gap-5 lg:flex">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
            Page {String(activeIdx + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-[var(--line)]">
            <div
              className="h-px bg-[var(--gold)] transition-all duration-500"
              style={{ width: `${((activeIdx + 1) / Math.max(sections.length, 1)) * 100}%` }}
            />
          </div>
          <span className="max-w-[18rem] truncate font-[family:var(--font-display)] text-sm italic text-[var(--river-deep)]">
            {sections[activeIdx]?.title}
          </span>
        </div>
      ) : null}

      <div className="invisible pointer-events-none absolute left-0 top-0 -z-10 hidden lg:block">
        <div className={widthClass}>
          {sections.map((section, index) => (
            <div
              key={`${index}-${section.title}-measure`}
              ref={(node) => setMeasurementRef(node, index)}
              className="relative mx-auto"
            >
              <div className="relative grid grid-cols-2 overflow-visible">
                <div className="relative overflow-hidden border-r border-black/10 text-left">
                  <VisualPlate
                    section={section}
                    index={index}
                    fallbackImage={fallbackImage}
                    cityName={cityName}
                  />
                </div>

                <div className="relative overflow-hidden text-left">
                  <NarrativePage
                    section={section}
                    index={index}
                    total={sections.length}
                    cityName={cityName}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 hidden lg:block">
        <div className={`flex items-start ${showIntro ? "py-12" : "py-2 pb-8 lg:pb-10"}`}>
          <BookSpread
            sections={sections}
            activeIdx={desktopActiveIdx}
            flipState={flipState}
            fallbackImage={fallbackImage}
            cityName={cityName}
            onSelectSection={selectSection}
            onPrevPage={turnPrev}
            onNextPage={turnNext}
            widthClass={widthClass}
            heightClass={desktopHeightClass}
            minHeightPx={measuredBookHeight}
            immersive={immersive}
          />
        </div>
      </div>

      <div className="relative z-10">
        <MobileStack
          sections={sections}
          activeIdx={mobileActiveIdx}
          fallbackImage={fallbackImage}
          cityName={cityName}
          onSelectSection={selectSection}
          setMobileRef={setMobileRef}
        />
      </div>
    </section>
  );
}
