"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";

type Stop = {
  time: string;
  stop: string;
  plan?: string;
  story: string;
  details: string[];
  culturalStory: string;
  image?: string;
  images?: string[];
  meal?: string;
  hotel?: string;
  transit?: string;
  placeDetail?: string;
};

export type RouteStopTarget = { index: number; time: string; name: string };

type Props = {
  stops: Stop[];
  routeStory: string;
  routeTitle: string;
  onAddStopNote?: (stop: Stop, index: number) => void;
};

function captionFor(stop: Stop): string {
  return (
    stop.placeDetail?.trim() ||
    stop.plan?.trim() ||
    `Seen around ${stop.time}, during ${stop.stop}.`
  );
}

function imageStackFor(stop: Stop): string[] {
  const frames = [...(stop.images ?? []), stop.image]
    .filter((frame): frame is string => Boolean(frame?.trim()))
    .filter((frame, index, all) => all.indexOf(frame) === index)
    .slice(0, 3);

  return frames;
}

function cultureLead(story: string) {
  const trimmed = story.trim();
  if (!trimmed) return "";
  const sentence = trimmed.split(/(?<=[.!?。！？])\s+/)[0]?.trim() ?? trimmed;
  return sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence;
}

function useOneShotReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!ref.current || revealed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [revealed]);

  return { ref, revealed };
}

function ExperienceBlock({ stop }: { stop: Stop }) {
  const experience = stop.plan?.trim() || stop.story;
  const { ref, revealed } = useOneShotReveal();
  return (
    <section ref={ref}>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
        You will
      </p>
      <div className="mt-3 overflow-hidden border-l border-[var(--gold)]/40 pl-4">
        <motion.p
          initial={{ opacity: 0, y: 10, clipPath: "inset(0 100% 0 0)" }}
          animate={
            revealed
              ? { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }
              : { opacity: 0, y: 10, clipPath: "inset(0 100% 0 0)" }
          }
          transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-[17px] leading-[1.75] text-[var(--river-deep)]/90 lg:text-[18px]"
        >
          {experience}
        </motion.p>
      </div>
    </section>
  );
}

function CultureBlock({ story }: { story: string }) {
  const trimmedStory = story.trim();
  const [open, setOpen] = useState(false);
  if (!trimmedStory) return null;
  const lead = cultureLead(trimmedStory);
  return (
    <section className="relative rotate-[1deg] border border-[var(--line)] bg-[rgba(247,239,214,0.9)] px-5 py-4 shadow-[0_14px_28px_rgba(17,25,35,0.08)]">
      <div className="absolute -top-3 left-5 h-5 w-14 -rotate-[4deg] border border-black/5 bg-[rgba(244,236,220,0.76)] backdrop-blur-[2px]" />
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
        Marginalia
      </p>
      <p className="mt-3 font-[family:var(--font-display)] text-lg italic leading-[1.5] text-[var(--river-deep)]/82">
        &ldquo;{lead}&rdquo;
      </p>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]/65 transition hover:text-[var(--cinnabar)]"
      >
        <span>{open ? "[-]" : "[+]"}</span>
        {open ? "Hide context" : "Read context"}
      </button>
      <motion.div
        initial={false}
        animate={
          open
            ? { height: "auto", opacity: 1, marginTop: 14 }
            : { height: 0, opacity: 0, marginTop: 0 }
        }
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <p className="border-t border-[var(--gold)]/35 pt-4 text-sm leading-7 text-[var(--muted)]">
          {trimmedStory}
        </p>
      </motion.div>
    </section>
  );
}

function NoticeList({ details }: { details: string[] }) {
  if (!details?.length) return null;
  return (
    <section>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">
        What to notice
      </p>
      <div className="mt-3 grid gap-2">
        {details.map((detail, detailIndex) => (
          <div key={`notice-${detailIndex}`} className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6 text-[var(--muted)]/88">
            <span className="mt-3 h-px w-5 bg-[var(--gold)]/55" />
            <span className="handwritten">{detail}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PracticalStrip({ stop }: { stop: Stop }) {
  const items = [
    { label: "Place", value: stop.placeDetail },
    { label: "Eat", value: stop.meal },
    { label: "Move", value: stop.transit },
    { label: "Stay", value: stop.hotel },
  ].filter((item) => item.value?.trim());

  if (!items.length) return null;

  return (
    <section>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
        Practical notes
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-1 xl:grid-cols-2">
        {items.map((item, itemIndex) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -2, rotate: 0 }}
            className="relative overflow-hidden border border-[var(--line)]/60 bg-[rgba(244,236,220,0.86)] px-4 py-3 text-left shadow-[0_7px_0_rgba(255,255,255,0.45),0_14px_24px_rgba(42,49,58,0.08)] transition-all hover:border-[var(--gold)]/70 hover:bg-white"
            style={{ rotate: `${itemIndex % 2 === 0 ? 0.6 : -0.6}deg` }}
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_6px_-2px,transparent_6px,rgba(214,198,171,0.9)_6.5px)] [background-size:14px_8px]" />
            <div className="absolute inset-x-0 bottom-0 h-2 rotate-180 bg-[radial-gradient(circle_at_6px_-2px,transparent_6px,rgba(214,198,171,0.9)_6.5px)] [background-size:14px_8px]" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-1 border-t border-dashed border-[var(--line)]/60 pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--river-deep)]">
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ImagePlate({ stop }: { stop: Stop }) {
  const { t } = useLocale();
  const frames = imageStackFor(stop);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const frameCount = frames.length;

  useEffect(() => {
    if (!frameCount) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, frameCount - 1));
  }, [frameCount]);

  if (!frameCount) return null;

  const leadFrame = frames[activeIndex] ?? frames[0];
  const stackedFrames = frames
    .filter((_, index) => index !== activeIndex)
    .slice(0, 2);

  const showNextFrame = () => {
    if (frameCount <= 1) return;
    setDirection(1);
    setActiveIndex((current) => (current + 1) % frameCount);
  };

  return (
    <figure className="group relative pr-4 pt-5">
      <div className="pointer-events-none absolute right-0 top-0 h-[88%] w-[86%] border border-[var(--line)]/45 bg-[var(--paper)] shadow-[0_8px_24px_rgba(42,49,58,0.08)] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[4deg]" />
      <div className="pointer-events-none absolute right-2 top-2 h-[88%] w-[86%] border border-[var(--line)]/45 bg-[var(--paper-deep)] shadow-[0_10px_28px_rgba(42,49,58,0.1)] transition-transform duration-500 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-[2.5deg]" />

      {stackedFrames.map((frame, index) => (
        <div
          key={`${frame}-stack-${index}`}
          className="pointer-events-none absolute right-[10px] top-[10px] h-[86%] w-[84%] overflow-hidden border-[8px] border-white bg-white scrapbook-shadow transition-transform duration-500"
          style={{
            transform: `translate(${16 + index * 10}px, ${6 + index * 8}px) rotate(${index % 2 === 0 ? 3.5 : 2.2}deg)`,
            zIndex: index + 1,
          }}
        >
          <img
            src={frame}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-55 saturate-[0.82] sepia-[0.12]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(17,25,35,0.16))]" />
        </div>
      ))}

      <button
        type="button"
        onClick={showNextFrame}
        className="relative z-10 block w-full overflow-hidden border-[10px] border-white bg-white text-left scrapbook-shadow transition-all duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-[1.2deg] group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.16)]"
        aria-label={
          frameCount > 1
            ? `Show next photo for ${stop.stop}`
            : `Photo for ${stop.stop}`
        }
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={`${leadFrame}-${activeIndex}`}
              src={leadFrame}
              alt={stop.stop}
              initial={{
                opacity: 0,
                scale: 1.035,
                x: direction > 0 ? 22 : -22,
                rotate: direction > 0 ? 1.2 : -1.2,
              }}
              animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
              exit={{
                opacity: 0,
                scale: 0.985,
                x: direction > 0 ? -18 : 18,
                rotate: direction > 0 ? -0.8 : 0.8,
              }}
              transition={{ duration: 0.34, ease: [0.22, 0.7, 0.2, 1] }}
              className="absolute inset-0 h-full w-full object-cover filter saturate-[0.86] sepia-[0.08] contrast-[0.98] brightness-[0.92] transition-all duration-700 lg:grayscale lg:saturate-[0.35] lg:contrast-[1.05] lg:brightness-[0.82] lg:group-hover:scale-[1.05] lg:group-hover:grayscale-0 lg:group-hover:saturate-[1.02] lg:group-hover:sepia-0 lg:group-hover:contrast-100 lg:group-hover:brightness-100"
              loading="lazy"
            />
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute inset-[10px] bg-gradient-to-t from-black/28 via-black/8 to-white/5 transition-opacity duration-500 lg:group-hover:opacity-0" />

        <div className="pointer-events-none absolute left-3 top-3 border border-black/5 bg-[var(--paper)]/88 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--river-deep)]/65 backdrop-blur-[1px]">
          Frame {String(activeIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}
        </div>

        <div className="pointer-events-none absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-[3deg] border border-black/5 bg-[rgba(244,236,220,0.72)] backdrop-blur-[2px]" />
        {frameCount > 1 ? (
          <div className="pointer-events-none absolute bottom-3 right-3 border border-black/5 bg-[var(--paper)]/88 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]/65 backdrop-blur-[1px]">
            {t("interpreting.card.tapToFlip")}
          </div>
        ) : null}
      </button>

      <figcaption className="mt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-[var(--muted)]">
        {captionFor(stop)}
      </figcaption>
    </figure>
  );
}

function StopNoteButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 self-start font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--river-deep)]/55 transition-colors hover:text-[var(--river-deep)] hover:underline hover:underline-offset-4"
    >
      Note this stop
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        -&gt;
      </span>
    </button>
  );
}

function RouteEpilogue({ stop, routeTitle }: { stop: Stop; routeTitle: string }) {
  const { locale } = useLocale();
  const frames = [...(stop.images ?? []), stop.image].filter(
    (frame): frame is string => Boolean(frame?.trim()),
  );
  const uniqueFrames = Array.from(new Set(frames)).slice(0, 3);
  const leadFrame = uniqueFrames[0];
  const supportFrames = uniqueFrames.slice(1);
  const stopMarkers = [stop.time, stop.meal, stop.transit].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  return (
    <motion.section
      className="mt-20 overflow-hidden border border-[var(--line)] bg-[linear-gradient(180deg,rgba(250,246,238,0.98),rgba(243,238,229,0.95))] shadow-[0_24px_60px_rgba(17,25,35,0.08)]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[22rem] overflow-hidden bg-[var(--paper)]">
          {leadFrame ? (
            <img
              src={leadFrame}
              alt={stop.stop}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.06),rgba(17,25,35,0.28))]" />
          <div className="absolute left-6 top-6 border border-white/45 bg-white/85 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--river-deep)]">
            {locale === "zh" ? "\u8def\u7ebf\u6536\u5c3e" : "Route Complete"}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white lg:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/72">
              {locale === "zh" ? "\u5df2\u5b8c\u6210" : "Completed"}
            </p>
            <h3 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[1.02] lg:text-5xl">
              {routeTitle}
            </h3>
          </div>
        </div>

        <div className="grid gap-4 p-6 lg:p-8">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
              {locale === "zh" ? "\u6700\u540e\u4e00\u7ad9" : "Final Stop"}
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-2xl leading-[1.18] text-[var(--river-deep)]">
              {stop.stop}
            </p>
            {stopMarkers.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {stopMarkers.map((marker) => (
                  <span key={marker} className="border border-[var(--line)] bg-white/65 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {marker}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {supportFrames.length ? (
            <div className="grid grid-cols-2 gap-3">
              {supportFrames.map((frame, index) => (
                <div
                  key={`${frame}-${index}`}
                  className={`overflow-hidden border border-white/70 bg-white shadow-[0_12px_30px_rgba(17,25,35,0.1)] ${
                    index === 1 ? "col-span-2" : ""
                  }`}
                >
                  <img
                    src={frame}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--gold)]">
              Archive note
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--river-deep)]/88">
              The journey ends on the coast, but the sequence stays open for the next chapter.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StopNode({
  stop,
  index,
  total,
  onAddStopNote,
}: {
  stop: Stop;
  index: number;
  total: number;
  onAddStopNote?: (stop: Stop, index: number) => void;
}) {
  // Left pane = ACTION layer: time / place / "You will" / Practical notes.
  // Right pane = PERCEPTION layer: image / culture / notice / add-note.
  // Fixed assignment (no left/right alternation) so users always know where
  // to look for "what to do" vs "why it matters". Avoids the empty-side
  // problem of zigzag layouts.
  const actionPane = (
    <div className="grid gap-7 lg:pr-12 lg:text-right">
      <div className="flex items-baseline gap-4 lg:flex-row-reverse">
        <p className="font-mono text-3xl md:text-5xl font-black tracking-tighter text-[var(--cinnabar)] xl:text-6xl">
          {stop.time}
        </p>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--muted)]/65">
          Entry_{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-[family:var(--font-display)] text-4xl leading-[1.05] text-[var(--river-deep)] xl:text-5xl">
        {stop.stop}
      </h3>
      <ExperienceBlock stop={stop} />
      <PracticalStrip stop={stop} />
    </div>
  );

  const perceptionPane = (
    <div className="grid gap-7 lg:pl-12">
      <ImagePlate stop={stop} />
      <CultureBlock story={stop.culturalStory} />
      <NoticeList details={stop.details} />
      <StopNoteButton onClick={onAddStopNote ? () => onAddStopNote(stop, index) : undefined} />
    </div>
  );

  return (
    <motion.article
      id={`stop-${index}`}
      className="relative w-full py-12 lg:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
    >
      <motion.div
        className="absolute left-4 top-12 z-10 flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-[var(--background)] bg-[var(--cinnabar)] shadow-[0_0_0_1px_var(--cinnabar),0_8px_22px_rgba(182,66,53,0.24)] lg:left-1/2 lg:top-24 lg:-translate-x-1/2"
        variants={{
          hidden: { scale: 0.72, opacity: 0.45 },
          visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </motion.div>

      <div className="grid gap-10 pl-12 lg:grid-cols-2 lg:gap-0 lg:pl-0">
        <div>{actionPane}</div>
        <div>{perceptionPane}</div>
      </div>
    </motion.article>
  );
}

export function TimeAxisItinerary({ stops, routeStory, routeTitle, onAddStopNote }: Props) {
  const [spineProgress, setSpineProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const spineScale = useSpring(spineProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.25,
  });

  const briefStory = useMemo(() => routeStory.trim(), [routeStory]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const updateProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const travel = rect.height + viewportHeight;
      const progressed = (viewportHeight - rect.top) / Math.max(travel, 1);
      setSpineProgress(Math.min(1, Math.max(0, progressed)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [stops.length, routeTitle]);

  if (stops.length === 0) return null;
  const lastStop = stops[stops.length - 1];

  return (
    <section ref={sectionRef} id="itinerary" className="relative overflow-hidden bg-[var(--background)] bg-grain pb-28 pt-16 lg:pb-40 lg:pt-24">
      <div className="site-container relative z-10">
        <header className="mx-auto mb-20 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[var(--cinnabar)]" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
              Today&apos;s Route
            </p>
            <span className="h-px w-8 bg-[var(--cinnabar)]" />
          </div>
          <h2 className="mt-6 font-[family:var(--font-display)] text-5xl leading-[1] text-[var(--river-deep)] md:text-6xl">
            What you will <span className="italic text-[var(--gold)]">experience</span> today.
          </h2>
          {briefStory ? (
            <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-[1.8] text-[var(--muted)] handwritten lg:text-[19px]">
              {briefStory}
            </p>
          ) : null}
        </header>

        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute left-4 top-0 bottom-20 w-px bg-[var(--line)]/25 lg:left-1/2 lg:-translate-x-1/2" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-0 bottom-20 w-[2px] origin-top bg-gradient-to-b from-[var(--cinnabar)] via-[var(--gold)] to-[var(--gold)]/10 lg:left-1/2 lg:-translate-x-1/2"
            style={{ scaleY: spineScale }}
          />

          {stops.map((stop, idx) => (
            <StopNode
              key={`stop-${idx}`}
              stop={stop}
              index={idx}
              total={stops.length}
              onAddStopNote={onAddStopNote}
            />
          ))}

          {lastStop ? <RouteEpilogue stop={lastStop} routeTitle={routeTitle} /> : null}

          <motion.div
            className="mt-20 flex flex-col items-center pb-24 lg:pb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--cinnabar)]/30 bg-[var(--paper-deep)]">
              <div className="relative z-10 h-2 w-2 rounded-full bg-[var(--cinnabar)]" />
            </div>
            <p className="mt-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--cinnabar)]">
              End of {routeTitle}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
