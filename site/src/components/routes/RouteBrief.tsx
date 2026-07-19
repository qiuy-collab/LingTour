"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { StoryRoute } from "@/data/routes";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { resolvePrimaryMedia } from "@/types/media";

type Props = { route: StoryRoute };

function truncate(value: string, max = 168): string {
  const clean = value.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function splitAudience(value: string): string[] {
  return value
    .split(/,|\/|&|\band\b/gi)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function RouteBrief({ route }: Props) {
  const leadStop = route.itinerary[0];
  const leadMedia = resolvePrimaryMedia(leadStop?.primaryMedia, leadStop?.image || route.image);
  const promiseBody = truncate(route.summary || route.story || route.title);
  const audience = splitAudience(route.audience);
  const metrics = [
    { label: "Duration", value: route.duration },
    { label: "Stops", value: String(route.itinerary.length).padStart(2, "0") },
    { label: "Culture", value: route.culture },
  ];
  const bestMoment = useMemo(() => {
    const selected =
      route.itinerary.find((stop) => stop.meal)?.story ||
      route.itinerary.find((stop) => stop.culturalStory)?.culturalStory ||
      route.itinerary[0]?.plan ||
      route.story;
    return truncate(selected || route.title, 112);
  }, [route.itinerary, route.story, route.title]);

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[var(--night)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(197,160,57,0.16),transparent_30%),radial-gradient(circle_at_86%_26%,rgba(83,131,147,0.18),transparent_34%)]" />
      <div className="site-container relative pb-10 pt-28 sm:pb-12 lg:pb-14 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14">
          <div className="max-w-[44rem]">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-white/52">
              <span className="text-[var(--gold)]">Route file</span>
              <span aria-hidden>/</span>
              <span>{route.city}</span>
              <span aria-hidden>/</span>
              <span>{route.culture}</span>
            </div>

            <h1 className="mt-6 max-w-[11ch] font-[family:var(--font-display)] text-[clamp(3.4rem,7vw,7.2rem)] leading-[0.86] tracking-[-0.06em]">
              {route.title}
            </h1>
            <p className="mt-7 max-w-[39rem] text-base leading-8 text-white/68 lg:text-lg">
              {promiseBody}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/interpreting#booking" className="lt-action lt-action-gold">
                Book this route <span aria-hidden>→</span>
              </Link>
              <Link
                href="#itinerary"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/26 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-[var(--night)]"
              >
                Read the day
              </Link>
            </div>
          </div>

          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-white/14 bg-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:aspect-[16/11]">
              <MediaFrame
                asset={leadMedia}
                fallbackSrc={route.image}
                alt={`${route.title} route preview`}
                mode={leadMedia?.type === "video" ? "interactive" : "image"}
                eager
                mediaClassName="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_56%,rgba(7,16,22,0.72))]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 sm:p-7">
                <div>
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/54">
                    First coordinate
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-2xl leading-none sm:text-3xl">
                    {leadStop?.stop || route.city}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-bold text-[var(--gold)]">
                  {leadStop?.time || route.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/12 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-white/38">
              Best for
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(audience.length ? audience : [route.audience]).map((item) => (
                <span key={item} className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/66">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-[46rem] text-sm leading-6 text-white/52">
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Best moment · </span>
              {bestMoment}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 sm:gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="min-w-0">
                <p className="font-[family:var(--font-display)] text-2xl leading-none text-white sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-2 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-white/36">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
