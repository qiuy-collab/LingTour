"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";
import type { StoryRoute } from "@/data/routes";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  routes: StoryRoute[];
  cityAdcode: number;
  cityName: string;
};

export function RelatedRouteHub({ routes, cityAdcode, cityName }: Props) {
  const [hoveredRouteIdx, setHoveredRouteIdx] = useState<number | null>(null);
  const features = useMemo(() => getMapFeatures(), []);

  const mapData = useMemo(() => {
    if (!features.length) return null;
    const projection = buildProjection(features, 300, 220, 12);
    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((f: CityFeature) => ({
        adcode: f.properties.adcode,
        path: featureToPath(f, projection.point),
      })),
    };
  }, [features]);

  const collectAdcodes = (route: StoryRoute): number[] => {
    return route.itinerary
      .map(() => cityAdcode)
      .filter((v, i, a) => a.indexOf(v) === i);
  };

  if (routes.length === 0) {
    return (
      <p className="mt-8 text-sm text-[var(--muted)]">
        No routes linked yet. Routes covering {cityName} will appear here.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
      {/* Left: Route cards */}
      <div className="grid gap-5">
        {routes.map((route, idx) => (
          <Reveal key={route.slug} delay={idx * 80}>
            <Link
              href={`/routes/${route.slug}`}
              className="group lux-card flex flex-col gap-4 border border-[var(--line)] bg-white p-5 transition hover:border-[var(--cinnabar)] sm:flex-row sm:gap-6"
              onMouseEnter={() => setHoveredRouteIdx(idx)}
              onMouseLeave={() => setHoveredRouteIdx(null)}
            >
              <div
                className="image-sheen h-28 w-full shrink-0 bg-cover bg-center sm:h-24 sm:w-36"
                style={{ backgroundImage: `url(${route.image})` }}
              />
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[var(--river-deep)] px-2 py-0.5 text-xs text-white">
                    {route.culture}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{route.duration}</span>
                  <span className="text-xs text-[var(--muted)]">{route.audience}</span>
                </div>
                <h3 className="mt-2 font-[family:var(--font-display)] text-xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
                  {route.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{route.summary}</p>
                <p className="mt-auto pt-3 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-1">
                  Read route details →
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Right: Micro map */}
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-label text-[var(--cinnabar)]">Route geography</p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)]">
            Where {cityName}&apos;s routes cross
          </h3>
          <div className="relative mt-6 overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-soft)]">
            {mapData ? (
              <div className="relative">
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="w-full"
                  role="img"
                  aria-label={`Guangdong map highlighting ${cityName}`}
                >
                  <title>{cityName} on Guangdong map</title>
                  {mapData.paths.map((city) => {
                    const isHighlighted = city.adcode === cityAdcode;
                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        fill={isHighlighted ? "#b64235" : "#d8d0c2"}
                        stroke="#fffaf1"
                        strokeWidth={isHighlighted ? 1.2 : 0.6}
                        opacity={isHighlighted ? 1 : 0.6}
                        className="transition-[fill,opacity] duration-300"
                      />
                    );
                  })}
                </svg>

                {/* Route tooltip on hover */}
                {hoveredRouteIdx !== null && routes[hoveredRouteIdx] && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mx-4 mb-4 border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]"
                  >
                    <p className="text-label text-[var(--cinnabar)]">Hovered route</p>
                    <p className="mt-2 font-[family:var(--font-display)] text-lg leading-tight text-[var(--river-deep)]">
                      {routes[hoveredRouteIdx].title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {routes[hoveredRouteIdx].itinerary.length} stops · {routes[hoveredRouteIdx].duration}
                    </p>
                    <div className="mt-3 grid gap-1">
                      {routes[hoveredRouteIdx].itinerary.slice(0, 3).map((stop) => (
                        <p key={stop.stop} className="text-xs leading-5 text-[var(--ink)]">
                          <span className="text-[var(--cinnabar)]">{stop.time}</span> — {stop.stop}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid h-48 place-items-center text-xs text-[var(--muted)]">Map</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
