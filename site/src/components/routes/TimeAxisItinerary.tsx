"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StoryRoute } from "@/data/routes";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, useGSAP } from "@/lib/motion";
import type { MediaAsset } from "@/types/media";
import {
  dedupeMedia,
  mediaPoster,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

type Stop = StoryRoute["itinerary"][number];

export type RouteStopTarget = { index: number; time: string; name: string };

type Props = {
  stops: Stop[];
  routeStory: string;
  routeTitle: string;
  onAddStopNote?: (stop: Stop, index: number) => void;
};

function mediaFor(stop: Stop): MediaAsset[] {
  const primary = resolvePrimaryMedia(stop.primaryMedia, stop.image);
  return dedupeMedia([
    ...(primary ? [primary] : []),
    ...resolveMediaGallery(stop.media, stop.images ?? []),
  ]).slice(0, 6);
}

function captionFor(stop: Stop): string {
  return stop.placeDetail?.trim() || stop.plan?.trim() || `${stop.time} · ${stop.stop}`;
}

function StopMedia({ stop }: { stop: Stop }) {
  const frames = useMemo(() => mediaFor(stop), [stop]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(frames.length - 1, 0)));
  }, [frames.length]);

  if (!frames.length) return null;
  const activeMedia = frames[activeIndex] ?? frames[0];

  return (
    <figure className="min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--night)] shadow-[0_18px_58px_rgba(17,25,35,0.13)]">
        <MediaFrame
          asset={activeMedia}
          fallbackSrc={mediaPoster(activeMedia, stop.image ?? "")}
          alt={stop.stop}
          mode={activeMedia.type === "video" ? "interactive" : "image"}
          mediaClassName="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-4">
          <span className="rounded-full border border-white/24 bg-black/28 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            Field media
          </span>
          <span className="rounded-full border border-white/24 bg-black/28 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {String(activeIndex + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {frames.length > 1 ? (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {frames.map((frame, index) => (
            <button
              key={`${frame.type}:${frame.url}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${frame.type} ${index + 1} of ${frames.length}`}
              aria-pressed={activeIndex === index}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[0.75rem] border-2 transition ${
                activeIndex === index
                  ? "border-[var(--cinnabar)] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <MediaFrame asset={frame} alt="" mode="image" mediaClassName="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <figcaption className="mt-3 font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-[var(--muted)]">
        {captionFor(stop)}
      </figcaption>
    </figure>
  );
}

function PracticalGrid({ stop }: { stop: Stop }) {
  const items = [
    { label: "Place", value: stop.placeDetail },
    { label: "Eat", value: stop.meal },
    { label: "Move", value: stop.transit },
    { label: "Stay", value: stop.hotel },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value?.trim()));

  if (!items.length) return null;

  return (
    <section>
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
        Practical notes
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--paper)]/62 p-4">
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--river-deep)]/78">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CultureContext({ story }: { story: string }) {
  const [open, setOpen] = useState(false);
  const cleanStory = story.trim();
  if (!cleanStory) return null;
  const lead = cleanStory.split(/[.!?。！？]/)[0]?.trim() || cleanStory;

  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--gold)]/28 bg-[var(--gold)]/[0.07] p-5">
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
        Cultural context
      </p>
      <p className="mt-3 font-[family:var(--font-display)] text-xl italic leading-7 text-[var(--river-deep)]">
        “{lead}.”
      </p>
      {cleanStory !== lead ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--gold)]/34 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--river-deep)] transition hover:border-[var(--river-deep)]"
          >
            {open ? "Close context" : "Read context"}
            <span aria-hidden>{open ? "−" : "+"}</span>
          </button>
          {open ? (
            <p className="mt-4 border-t border-[var(--gold)]/22 pt-4 text-sm leading-7 text-[var(--muted)]">
              {cleanStory}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function NoticeList({ details }: { details: string[] }) {
  if (!details.length) return null;
  return (
    <section>
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
        What to notice
      </p>
      <ul className="mt-3 grid gap-3">
        {details.map((detail, index) => (
          <li key={`${detail}-${index}`} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-[var(--muted)]">
            <span className="mt-[0.68rem] h-px bg-[var(--cinnabar)]" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StopCard({
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
  return (
    <Reveal delay={Math.min(index * 70, 210)}>
      <article id={`stop-${index}`} className="relative rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_20px_70px_rgba(17,25,35,0.08)] sm:p-7 lg:p-9">
        <div className="absolute -left-[1.94rem] top-9 z-10 grid h-4 w-4 place-items-center rounded-full border-[3px] border-[var(--background)] bg-[var(--cinnabar)] shadow-[0_0_0_1px_var(--cinnabar)] sm:-left-[2.44rem] lg:-left-[3.44rem]">
          <span className="h-1 w-1 rounded-full bg-white" />
        </div>

        <div className="mb-7 flex items-center justify-between gap-5 border-b border-[var(--line)] pb-5">
          <div className="flex items-baseline gap-3">
            <p className="font-[family:var(--font-display)] text-3xl leading-none text-[var(--cinnabar)] sm:text-4xl">
              {stop.time}
            </p>
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Stop {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
          <StopMedia stop={stop} />

          <div className="min-w-0">
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              You will experience
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-4xl leading-[0.96] tracking-[-0.035em] text-[var(--river-deep)] sm:text-5xl">
              {stop.stop}
            </h3>
            <p className="mt-5 text-base leading-8 text-[var(--river-deep)]/78">
              {stop.plan?.trim() || stop.story}
            </p>

            <div className="mt-7 grid gap-6">
              <PracticalGrid stop={stop} />
              <CultureContext story={stop.culturalStory} />
              <NoticeList details={stop.details} />
            </div>

            {onAddStopNote ? (
              <button
                type="button"
                onClick={() => onAddStopNote(stop, index)}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--river-deep)] px-5 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)] transition hover:bg-[var(--river-deep)] hover:text-white"
              >
                Note this stop <span aria-hidden>→</span>
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function RouteEpilogue({ stop, routeTitle }: { stop: Stop; routeTitle: string }) {
  const finalMedia = resolvePrimaryMedia(stop.primaryMedia, stop.image);
  return (
    <Reveal>
      <section className="mt-12 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--night)] text-white shadow-[0_28px_90px_rgba(17,25,35,0.2)] lg:mt-16">
        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <div className="relative min-h-[20rem] overflow-hidden">
            <MediaFrame
              asset={finalMedia}
              fallbackSrc={stop.image}
              alt={`${routeTitle} final stop`}
              mode={finalMedia?.type === "video" ? "interactive" : "image"}
              mediaClassName="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(7,16,22,0.76))]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/54">Final coordinate</p>
              <p className="mt-2 font-[family:var(--font-display)] text-3xl leading-none sm:text-4xl">{stop.stop}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 p-7 sm:p-9">
            <div>
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Route complete</p>
              <h3 className="mt-5 font-[family:var(--font-display)] text-4xl leading-[0.96] sm:text-5xl">{routeTitle}</h3>
              <p className="mt-5 text-sm leading-7 text-white/62">
                Keep the route open with a local interpreter, or return to the atlas for the next sequence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/interpreting#booking" className="lt-action lt-action-gold">Coordinate the route</Link>
              <Link href="/routes" className="inline-flex min-h-12 items-center rounded-full border border-white/22 px-5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] transition hover:bg-white hover:text-[var(--night)]">Back to atlas</Link>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export function TimeAxisItinerary({ stops, routeStory, routeTitle, onAddStopNote }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const briefStory = routeStory.trim();

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-route-progress]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              end: "bottom 72%",
              scrub: 0.45,
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: sectionRef, dependencies: [stops.length] },
  );

  if (!stops.length) return null;
  const lastStop = stops[stops.length - 1];

  return (
    <section ref={sectionRef} id="itinerary" className="relative overflow-hidden bg-[var(--background)] bg-grain pb-28 pt-16 lg:pb-36 lg:pt-24">
      <div className="site-container relative">
        <header className="grid gap-7 border-b border-[var(--line)] pb-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end lg:pb-14">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">Today’s route</p>
            <h2 className="mt-5 max-w-[11ch] font-[family:var(--font-display)] text-5xl leading-[0.92] tracking-[-0.05em] text-[var(--river-deep)] sm:text-6xl lg:text-7xl">
              Read the day, coordinate by coordinate.
            </h2>
          </div>
          <div className="lg:pb-1">
            {briefStory ? <p className="max-w-[46rem] text-base leading-8 text-[var(--muted)] lg:text-lg">{briefStory}</p> : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--line)] bg-white/55 px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{stops.length} stops</span>
              <span className="rounded-full border border-[var(--line)] bg-white/55 px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Mixed media field notes</span>
            </div>
          </div>
        </header>

        <div className="relative mx-auto mt-10 max-w-[82rem] pl-7 sm:mt-14 sm:pl-9 lg:pl-12">
          <div className="pointer-events-none absolute bottom-0 left-[0.45rem] top-0 w-px bg-[var(--line)] sm:left-[0.45rem] lg:left-[0.45rem]" />
          <div data-route-progress aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[0.4rem] top-0 w-[2px] origin-top bg-[linear-gradient(180deg,var(--cinnabar),var(--gold),rgba(197,160,57,0.14))] sm:left-[0.4rem] lg:left-[0.4rem]" />

          <div className="grid gap-8 lg:gap-10">
            {stops.map((stop, index) => (
              <StopCard
                key={`${stop.time}-${stop.stop}-${index}`}
                stop={stop}
                index={index}
                total={stops.length}
                onAddStopNote={onAddStopNote}
              />
            ))}
          </div>

          {lastStop ? <RouteEpilogue stop={lastStop} routeTitle={routeTitle} /> : null}
        </div>
      </div>
    </section>
  );
}
