"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { gsap, motionEase, ScrollTrigger, useGSAP } from "@/lib/motion";
import type { MediaAsset } from "@/types/media";
import {
  dedupeMedia,
  mediaPoster,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

type Stop = {
  time: string;
  stop: string;
  plan?: string;
  story: string;
  details: string[];
  culturalStory: string;
  image?: string;
  primaryMedia?: MediaAsset | null;
  images?: string[];
  media?: MediaAsset[];
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

function imageStackFor(stop: Stop): MediaAsset[] {
  const primary = resolvePrimaryMedia(stop.primaryMedia, stop.image);
  return dedupeMedia([
    ...(primary ? [primary] : []),
    ...resolveMediaGallery(stop.media, stop.images ?? []),
  ]).slice(0, 3);
}

function cultureLead(story: string) {
  const trimmed = story.trim();
  if (!trimmed) return "";
  const sentence = trimmed.split(/(?<=[.!?。！？])\s+/)[0]?.trim() ?? trimmed;
  return sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence;
}

function ExperienceBlock({ stop }: { stop: Stop }) {
  const experience = stop.plan?.trim() || stop.story;
  return (
    <section data-route-experience>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
        You will
      </p>
      <div className="mt-3 overflow-hidden border-l border-[var(--gold)]/40 pl-4">
        <p className="text-[17px] leading-[1.75] text-[var(--river-deep)]/90 lg:text-[18px]">
          {experience}
        </p>
      </div>
    </section>
  );
}

function CultureBlock({ story }: { story: string }) {
  const trimmedStory = story.trim();
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contentId = useId();

  useGSAP(
    () => {
      if (!contentRef.current) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(contentRef.current, {
          height: open ? "auto" : 0,
          autoAlpha: open ? 1 : 0,
          marginTop: open ? 14 : 0,
        });
        return;
      }
      gsap.to(contentRef.current, {
        height: open ? "auto" : 0,
        autoAlpha: open ? 1 : 0,
        marginTop: open ? 14 : 0,
        duration: 0.34,
        ease: motionEase.enter,
      });
    },
    { scope: contentRef, dependencies: [open], revertOnUpdate: false },
  );

  if (!trimmedStory) return null;
  const lead = cultureLead(trimmedStory);
  return (
    <section data-route-marginalia className="relative rotate-[1deg] border border-[var(--line)] bg-[rgba(247,239,214,0.9)] px-5 py-4 shadow-[0_14px_28px_rgba(17,25,35,0.08)]">
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
        aria-expanded={open}
        aria-controls={contentId}
        className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]/65 transition hover:text-[var(--cinnabar)]"
      >
        <span>{open ? "[-]" : "[+]"}</span>
        {open ? "Hide context" : "Read context"}
      </button>
      <div ref={contentRef} id={contentId} className="h-0 overflow-hidden opacity-0">
        <p className="border-t border-[var(--gold)]/35 pt-4 text-sm leading-7 text-[var(--muted)]">
          {trimmedStory}
        </p>
      </div>
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
          <div
            data-route-ticket
            key={item.label}
            className="relative overflow-hidden border border-[var(--line)]/60 bg-[rgba(244,236,220,0.86)] px-4 py-3 text-left shadow-[0_7px_0_rgba(255,255,255,0.45),0_14px_24px_rgba(42,49,58,0.08)] transition-all hover:-translate-y-0.5 hover:rotate-0 hover:border-[var(--gold)]/70 hover:bg-white"
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
          </div>
        ))}
      </div>
    </section>
  );
}

function ImagePlate({ stop }: { stop: Stop }) {
  const { t } = useLocale();
  const frames = imageStackFor(stop);
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const frameCount = frames.length;

  useEffect(() => {
    if (!frameCount) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, frameCount - 1));
  }, [frameCount]);

  useGSAP(
    () => {
      if (!mediaRef.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          mediaRef.current,
          { autoAlpha: 0, scale: 1.035, x: 22, rotation: 1.2 },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            rotation: 0,
            duration: 0.46,
            ease: motionEase.enter,
            clearProps: "transform,opacity,visibility",
          },
        );
      });
      return () => media.revert();
    },
    { scope: mediaRef, dependencies: [activeIndex], revertOnUpdate: true },
  );

  if (!frameCount) return null;

  const leadFrame = frames[activeIndex] ?? frames[0];
  const stackedFrames = frames
    .filter((_, index) => index !== activeIndex)
    .slice(0, 2);

  const showNextFrame = () => {
    if (frameCount <= 1) return;
    setActiveIndex((current) => (current + 1) % frameCount);
  };

  return (
    <figure data-route-image-plate className="group relative pr-4 pt-5">
      <div className="pointer-events-none absolute right-0 top-0 h-[88%] w-[86%] border border-[var(--line)]/45 bg-[var(--paper)] shadow-[0_8px_24px_rgba(42,49,58,0.08)] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[4deg]" />
      <div className="pointer-events-none absolute right-2 top-2 h-[88%] w-[86%] border border-[var(--line)]/45 bg-[var(--paper-deep)] shadow-[0_10px_28px_rgba(42,49,58,0.1)] transition-transform duration-500 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-[2.5deg]" />

      {stackedFrames.map((frame, index) => (
        <div
          key={`${frame.type}:${frame.url}-stack-${index}`}
          className="pointer-events-none absolute right-[10px] top-[10px] h-[86%] w-[84%] overflow-hidden border-[8px] border-white bg-white scrapbook-shadow transition-transform duration-500"
          style={{
            transform: `translate(${16 + index * 10}px, ${6 + index * 8}px) rotate(${index % 2 === 0 ? 3.5 : 2.2}deg)`,
            zIndex: index + 1,
          }}
        >
          <MediaFrame
            asset={frame}
            alt=""
            mode="image"
            mediaClassName="object-cover opacity-55 saturate-[0.82] sepia-[0.12]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(17,25,35,0.16))]" />
        </div>
      ))}

      <div
        className="relative z-10 block w-full overflow-hidden border-[10px] border-white bg-white text-left scrapbook-shadow transition-all duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-[1.2deg] group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.16)]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <div ref={mediaRef} className="absolute inset-0 h-full w-full">
              <MediaFrame
                asset={leadFrame}
                fallbackSrc={mediaPoster(leadFrame, stop.image ?? "")}
                alt={stop.stop}
                mode={leadFrame.type === "video" ? "interactive" : "image"}
                mediaClassName="object-cover filter saturate-[0.86] sepia-[0.08] contrast-[0.98] brightness-[0.92] transition-all duration-700 lg:grayscale lg:saturate-[0.35] lg:contrast-[1.05] lg:brightness-[0.82] lg:group-hover:scale-[1.05] lg:group-hover:grayscale-0 lg:group-hover:saturate-[1.02] lg:group-hover:sepia-0 lg:group-hover:contrast-100 lg:group-hover:brightness-100"
              />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-[10px] bg-gradient-to-t from-black/28 via-black/8 to-white/5 transition-opacity duration-500 lg:group-hover:opacity-0" />

        <div className="pointer-events-none absolute left-3 top-3 border border-black/5 bg-[var(--paper)]/88 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--river-deep)]/65 backdrop-blur-[1px]">
          Frame {String(activeIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}
        </div>

        <div className="pointer-events-none absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-[3deg] border border-black/5 bg-[rgba(244,236,220,0.72)] backdrop-blur-[2px]" />
        {frameCount > 1 ? (
          <button
            type="button"
            onClick={showNextFrame}
            className="absolute bottom-3 right-3 z-20 border border-black/5 bg-[var(--paper)]/92 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]/65 backdrop-blur-[1px] transition hover:bg-white hover:text-[var(--cinnabar)]"
            aria-label={`Show next media for ${stop.stop}`}
          >
            {t("interpreting.card.tapToFlip")}
          </button>
        ) : null}
      </div>

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
  const frames = imageStackFor(stop);
  const leadFrame = frames[0];
  const supportFrames = frames.slice(1);
  const stopMarkers = [stop.time, stop.meal, stop.transit].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  return (
    <section
      data-route-epilogue
      className="mt-20 overflow-hidden border border-[var(--line)] bg-[linear-gradient(180deg,rgba(250,246,238,0.98),rgba(243,238,229,0.95))] shadow-[0_24px_60px_rgba(17,25,35,0.08)]"
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[22rem] overflow-hidden bg-[var(--paper)]">
          {leadFrame ? (
            <MediaFrame
              asset={leadFrame}
              fallbackSrc={mediaPoster(leadFrame, stop.image ?? "")}
              alt={stop.stop}
              mode={leadFrame.type === "video" ? "interactive" : "image"}
              mediaClassName="object-cover"
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
                  key={`${frame.type}:${frame.url}-${index}`}
                  className={`overflow-hidden border border-white/70 bg-white shadow-[0_12px_30px_rgba(17,25,35,0.1)] ${
                    index === 1 ? "col-span-2" : ""
                  }`}
                >
                  <MediaFrame
                    asset={frame}
                    alt=""
                    mode="image"
                    mediaClassName="object-cover"
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
    </section>
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
    <div data-route-action className="grid gap-7 lg:pr-12 lg:text-right">
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
    <div data-route-perception className="grid gap-7 lg:pl-12">
      <ImagePlate stop={stop} />
      <CultureBlock story={stop.culturalStory} />
      <NoticeList details={stop.details} />
      <StopNoteButton onClick={onAddStopNote ? () => onAddStopNote(stop, index) : undefined} />
    </div>
  );

  return (
    <article
      data-route-stop
      id={`stop-${index}`}
      className="relative w-full py-12 lg:py-24"
    >
      <div
        data-route-dot
        className="absolute left-4 top-12 z-10 flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-[var(--background)] bg-[var(--cinnabar)] shadow-[0_0_0_1px_var(--cinnabar),0_8px_22px_rgba(182,66,53,0.24)] lg:left-1/2 lg:top-24 lg:-translate-x-1/2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      <div className="grid gap-10 pl-12 lg:grid-cols-2 lg:gap-0 lg:pl-0">
        <div>{actionPane}</div>
        <div>{perceptionPane}</div>
      </div>
    </article>
  );
}

export function TimeAxisItinerary({ stops, routeStory, routeTitle, onAddStopNote }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const briefStory = useMemo(() => routeStory.trim(), [routeStory]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const media = gsap.matchMedia();

      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          const { animate, desktop } = context.conditions ?? {};
          const animated = section.querySelectorAll(
            "[data-route-header], [data-route-stop], [data-route-action], [data-route-perception], [data-route-dot], [data-route-epilogue], [data-route-end]",
          );

          if (!animate) {
            gsap.set(animated, { clearProps: "all" });
            gsap.set("[data-route-spine]", { scaleY: 1 });
            return;
          }

          gsap.from("[data-route-header] > *", {
            autoAlpha: 0,
            y: 24,
            duration: 0.72,
            stagger: 0.12,
            ease: motionEase.enter,
            scrollTrigger: {
              trigger: "[data-route-header]",
              start: "top 88%",
              once: true,
            },
          });

          gsap.fromTo(
            "[data-route-spine]",
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 68%",
                end: "bottom 76%",
                scrub: 0.7,
              },
            },
          );

          const stopElements = gsap.utils.toArray<HTMLElement>("[data-route-stop]", section);
          stopElements.forEach((stopElement) => {
            const action = stopElement.querySelector("[data-route-action]");
            const perception = stopElement.querySelector("[data-route-perception]");
            const dot = stopElement.querySelector("[data-route-dot]");
            const tickets = stopElement.querySelectorAll("[data-route-ticket]");
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: stopElement,
                start: "top 84%",
                once: true,
              },
            });

            timeline
              .from(stopElement, {
                autoAlpha: 0,
                y: 40,
                duration: 0.68,
                ease: motionEase.enter,
              })
              .from(
                action,
                {
                  autoAlpha: 0,
                  x: desktop ? -28 : 0,
                  y: desktop ? 0 : 18,
                  duration: 0.65,
                  ease: motionEase.enter,
                },
                "<0.08",
              )
              .from(
                perception,
                {
                  autoAlpha: 0,
                  x: desktop ? 28 : 0,
                  y: desktop ? 0 : 20,
                  duration: 0.72,
                  ease: motionEase.enter,
                },
                "<0.06",
              )
              .from(
                dot,
                { autoAlpha: 0, scale: 0.28, duration: 0.5, ease: "back.out(2.4)" },
                "<0.08",
              );

            if (tickets.length) {
              timeline.from(
                tickets,
                { autoAlpha: 0, y: 10, rotation: 0, duration: 0.36, stagger: 0.07, ease: motionEase.enter },
                "-=0.28",
              );
            }
          });

          gsap.from("[data-route-epilogue]", {
            autoAlpha: 0,
            y: 34,
            duration: 0.78,
            ease: motionEase.enter,
            scrollTrigger: {
              trigger: "[data-route-epilogue]",
              start: "top 86%",
              once: true,
            },
          });

          gsap.from("[data-route-end]", {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.7,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: "[data-route-end]",
              start: "top 92%",
              once: true,
            },
          });
        },
      );

      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(refreshFrame);
        media.revert();
      };
    },
    { scope: sectionRef, dependencies: [stops.length, routeTitle], revertOnUpdate: true },
  );

  if (stops.length === 0) return null;
  const lastStop = stops[stops.length - 1];

  return (
    <section ref={sectionRef} id="itinerary" className="relative overflow-hidden bg-[var(--background)] bg-grain pb-28 pt-16 lg:pb-40 lg:pt-24">
      <div className="site-container relative z-10">
        <header data-route-header className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
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
          <div
            data-route-spine
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-0 bottom-20 w-[2px] origin-top bg-gradient-to-b from-[var(--cinnabar)] via-[var(--gold)] to-[var(--gold)]/10 lg:left-1/2 lg:-translate-x-1/2"
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

          <div
            data-route-end
            className="mt-20 flex flex-col items-center pb-24 lg:pb-16"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--cinnabar)]/30 bg-[var(--paper-deep)]">
              <div className="relative z-10 h-2 w-2 rounded-full bg-[var(--cinnabar)]" />
            </div>
            <p className="mt-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--cinnabar)]">
              End of {routeTitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
