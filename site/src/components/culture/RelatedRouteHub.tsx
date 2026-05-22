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
      <div className="grid gap-8">
        {routes.map((route, idx) => (
          <Reveal key={route.slug} delay={idx * 80}>
            <Link
              href={`/routes/${route.slug}`}
              className={`group relative flex flex-col gap-4 border border-[var(--line)] bg-white p-6 transition-all duration-500 scrapbook-shadow hover:border-[var(--cinnabar)] sm:flex-row sm:gap-8 ${idx % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'}`}
              onMouseEnter={() => setHoveredRouteIdx(idx)}
              onMouseLeave={() => setHoveredRouteIdx(null)}
            >
              <div
                className="image-sheen h-32 w-full shrink-0 border-4 border-white bg-cover bg-center scrapbook-shadow sm:h-28 sm:w-40"
                style={{ backgroundImage: `url(${route.image})` }}
              />
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[var(--river-deep)] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                    {route.culture}
                  </span>
                  <span className="text-[11px] font-medium tracking-wider text-[var(--muted)]">{route.duration}</span>
                </div>
                <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
                  {route.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)] line-clamp-2">
                  {route.summary}
                </p>
                <p className="mt-4 flex items-center gap-2 pt-3 text-sm font-bold tracking-widest text-[var(--cinnabar)] uppercase transition group-hover:translate-x-1">
                  <span>Explore Route</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Right: Micro map */}
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-label text-[var(--cinnabar)] handwritten">Route geography</p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
            Where {cityName}&apos;s routes cross
          </h3>
          <div className="relative mt-8 overflow-hidden border-8 border-white bg-white scrapbook-shadow -rotate-1">
            <div className="absolute inset-0 bg-grain opacity-[0.05] pointer-events-none" />
            {mapData ? (
              <div className="relative p-4">
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
                        fill={isHighlighted ? "#b64235" : "#ccd6ce"}
                        stroke="#fff"
                        strokeWidth={isHighlighted ? 1.5 : 0.8}
                        opacity={isHighlighted ? 1 : 0.7}
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
