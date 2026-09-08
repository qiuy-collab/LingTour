"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";
import type { StoryRoute } from "@/data/routes";
import { Reveal } from "@/components/ui/Reveal";
import type { CityCulture } from "@/data/culture";
import { useLocale } from "@/lib/locale-context";

type Props = {
  routes: StoryRoute[];
  cityAdcode: number;
  cityName: string;
  cities: Pick<CityCulture, "slug" | "adcode" | "routeSlugs">[];
};

export function RelatedRouteHub({ routes, cityAdcode, cityName, cities }: Props) {
  const { t } = useLocale();
  const [hoveredRouteIdx, setHoveredRouteIdx] = useState<number | null>(null);
  const features = useMemo(() => getMapFeatures(), []);
  const activeRoute = hoveredRouteIdx === null ? null : routes[hoveredRouteIdx];
  const highlightedAdcodes = useMemo(() => {
    if (!activeRoute) return new Set([cityAdcode]);
    const routeCodes = cities
      .filter((city) => city.routeSlugs.includes(activeRoute.slug))
      .map((city) => city.adcode);
    return new Set(routeCodes.length ? routeCodes : [cityAdcode]);
  }, [activeRoute, cities, cityAdcode]);

  const mapData = useMemo(() => {
    if (!features.length) return null;
    const projection = buildProjection(features, 300, 220, 12);
    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((feature: CityFeature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
      })),
    };
  }, [features]);

  if (routes.length === 0) {
    return <p className="mt-8 text-sm text-[var(--muted)]">{t("culture.detail.noRelatedRoutes")}</p>;
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)] lg:gap-16">
      <div className="grid gap-7">
        {routes.map((route, idx) => (
          <Reveal key={route.slug} delay={idx * 80}>
            <Link
              href={`/routes/${route.slug}`}
              className="group grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--line)] pb-7 transition-colors hover:border-[var(--gold)] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
              onMouseEnter={() => setHoveredRouteIdx(idx)}
              onMouseLeave={() => setHoveredRouteIdx(null)}
              onFocus={() => setHoveredRouteIdx(idx)}
              onBlur={() => setHoveredRouteIdx(null)}
            >
              <div className="aspect-[4/5] overflow-hidden border-4 border-white bg-[var(--paper)] scrapbook-shadow sm:aspect-[5/4]">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${route.image})` }}
                />
              </div>
              <div className="min-w-0 py-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  {route.culture}
                </p>
                <h3 className="mt-2 font-[family:var(--font-display)] text-2xl leading-[1.02] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-3xl">
                  {route.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{route.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <span className="text-[var(--muted)]">{route.duration}</span>
                  <span className="text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/40 underline-offset-4">
                    {t("culture.detail.readRoute")}
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <h3 className="font-[family:var(--font-display)] text-3xl leading-[1.02] text-[var(--river-deep)]">
            {activeRoute?.title || "Routes through this city"}
          </h3>
          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-[var(--muted)]">
            Select a route to see the places it connects.
          </p>
          <div className="relative mt-7 overflow-hidden border-[0.5rem] border-white bg-white scrapbook-shadow">
            {mapData ? (
              <div className="relative p-4">
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="w-full"
                  role="img"
                  aria-label={t("culture.detail.routeMapLabel")}
                >
                  <title>{activeRoute?.title || cityName}</title>
                  {mapData.paths.map((city) => {
                    const isHighlighted = highlightedAdcodes.has(city.adcode);
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

                {hoveredRouteIdx !== null && routes[hoveredRouteIdx] ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 border-t border-[var(--line)] pt-3"
                  >
                    <p className="font-[family:var(--font-display)] text-lg leading-tight text-[var(--river-deep)]">
                      {routes[hoveredRouteIdx].title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {routes[hoveredRouteIdx].itinerary.length} stops / {routes[hoveredRouteIdx].duration}
                    </p>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <div className="grid h-48 place-items-center text-xs text-[var(--muted)]">Map</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
