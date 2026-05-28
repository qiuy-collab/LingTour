"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getMapFeatures,
  buildProjection,
  featureToPath,
} from "@/lib/map-projection";
import { fetchRouteRegions, fetchRoutes } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import type { StoryRoute } from "@/data/routes";
import {
  DEFAULT_ROUTE_REGIONS,
  pickRouteRegionText,
  type RouteRegion,
} from "@/lib/route-regions";

const initialFeatures = getMapFeatures();

export function RoutesMegaMenu({ active }: { active: boolean }) {
  const { locale } = useLocale();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [routes, setRoutes] = useState<StoryRoute[]>([]);
  const [routeRegions, setRouteRegions] =
    useState<RouteRegion[]>(DEFAULT_ROUTE_REGIONS);

  useEffect(() => {
    fetchRoutes(locale).then(setRoutes).catch(() => {});
    fetchRouteRegions(locale)
      .then((data) =>
        setRouteRegions(data.length ? data : DEFAULT_ROUTE_REGIONS),
      )
      .catch(() => setRouteRegions(DEFAULT_ROUTE_REGIONS));
  }, [locale]);

  const mapPaths = useMemo(() => {
    if (!initialFeatures.length) {
      return null;
    }

    const projection = buildProjection(initialFeatures, 150, 88, 8);

    return {
      width: projection.width,
      height: projection.height,
      paths: initialFeatures.map((feature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
      })),
    };
  }, []);

  return (
    <div className="group/routes relative">
      <Link
        href="/routes"
        className={`px-3 py-3 text-sm transition ${
          active
            ? "text-[var(--cinnabar)]"
            : "text-[var(--muted)] hover:text-[var(--ink)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        Routes
      </Link>

      <div className="invisible fixed left-0 top-[4.55rem] z-40 w-screen translate-y-3 border-y border-black/5 bg-[var(--paper-deep)] bg-grain opacity-0 shadow-[0_40px_100px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-400 group-hover/routes:visible group-hover/routes:translate-y-0 group-hover/routes:opacity-100 group-focus-within/routes:visible group-focus-within/routes:translate-y-0 group-focus-within/routes:opacity-100">
        <div className="mx-auto max-w-[82rem] px-10 py-12">
          <div className="mb-12 flex flex-col justify-between gap-8 border-b border-black/5 pb-10 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                Routes / Field Discovery
              </p>
            </div>
            <Link
              href="/routes"
              className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] transition-all hover:bg-[var(--river-deep)] hover:text-white"
            >
              View all routes
            </Link>
          </div>

          <div className="grid gap-x-10 gap-y-12 md:grid-cols-3 xl:grid-cols-5">
            {routeRegions.map((region) => {
              const regionRoutes = routes.filter(
                (route) => route.routeRegionKey === region.key,
              );
              const regionTitle = pickRouteRegionText(region.title, locale);
              const regionNote = pickRouteRegionText(region.note, locale);

              return (
                <motion.div
                  key={region.key}
                  className="group/region"
                  animate={{
                    scale: hoveredRegion === region.key ? 1.02 : 1,
                    opacity:
                      hoveredRegion && hoveredRegion !== region.key ? 0.45 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={
                      regionRoutes[0] ? `/routes/${regionRoutes[0].slug}` : "/routes"
                    }
                    className="block"
                  >
                    <div className="relative h-32 overflow-hidden border border-black/10 bg-white scrapbook-shadow transition group-hover/region:-translate-y-1">
                      {mapPaths ? (
                        <svg
                          viewBox={`0 0 ${mapPaths.width} ${mapPaths.height}`}
                          className="h-full w-full scale-110 grayscale-[0.2] opacity-80 transition-all duration-500 group-hover/region:grayscale-0 group-hover/region:opacity-100"
                          role="img"
                          aria-label={`${regionTitle} highlighted on Guangdong map`}
                        >
                          <title>{regionTitle}</title>
                          {mapPaths.paths.map((city) => (
                            <path
                              key={city.adcode}
                              d={city.path}
                              fill={
                                region.adcodes.includes(city.adcode)
                                  ? "#b64235"
                                  : "#8a968d"
                              }
                              stroke="#fff"
                              strokeWidth={
                                region.adcodes.includes(city.adcode) ? 2 : 1.2
                              }
                              opacity={1}
                              onMouseEnter={() => setHoveredRegion(region.key)}
                              onMouseLeave={() => setHoveredRegion(null)}
                            />
                          ))}
                        </svg>
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-[var(--muted)] handwritten">
                          Loading Map...
                        </div>
                      )}
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[var(--river-deep)] transition group-hover/region:text-[var(--cinnabar)]">
                      {regionTitle}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      {regionNote}
                    </p>
                  </Link>
                  <div className="mt-6 space-y-3 border-t border-black/5 pt-4">
                    {regionRoutes.slice(0, 3).map((route) => (
                      <Link
                        key={route.slug}
                        href={`/routes/${route.slug}`}
                        className="group/link flex items-center gap-2 text-sm text-[var(--muted)] transition-all hover:translate-x-1 hover:text-[var(--cinnabar)]"
                      >
                        <span className="h-1 w-1 rounded-full bg-[var(--gold)]/40 group-hover/link:bg-[var(--cinnabar)]" />
                        <span className="handwritten overflow-hidden text-ellipsis whitespace-nowrap">
                          {route.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
