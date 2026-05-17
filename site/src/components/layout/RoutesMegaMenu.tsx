"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMapFeatures, buildProjection, featureToPath } from "@/lib/map-projection";
import { fetchRoutes } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import type { StoryRoute } from "@/data/routes";

const initialFeatures = getMapFeatures();

const regionCityMap: Record<string, { en: string[]; zh: string[] }> = {
  "Bay Area Core": {
    en: ["Guangzhou", "Foshan", "Shenzhen"],
    zh: ["广州", "佛山", "深圳"],
  },
  "Chaoshan Coast": {
    en: ["Chaozhou", "Shantou"],
    zh: ["潮州", "汕头"],
  },
  "Hakka Mountains": {
    en: ["Meizhou"],
    zh: ["梅州"],
  },
  "Southern Sea": {
    en: ["Zhanjiang"],
    zh: ["湛江"],
  },
  "Northern Gateway": {
    en: ["Shaoguan"],
    zh: ["韶关"],
  },
};

const routeRegions = [
  {
    title: "Bay Area Core",
    note: "Guangzhou / Foshan / Shenzhen",
    adcodes: [440100, 440300, 440600],
  },
  {
    title: "Chaoshan Coast",
    note: "Chaozhou / Shantou",
    adcodes: [445100, 440500],
  },
  {
    title: "Hakka Mountains",
    note: "Meizhou",
    adcodes: [441400],
  },
  {
    title: "Southern Sea",
    note: "Zhanjiang",
    adcodes: [440800],
  },
  {
    title: "Northern Gateway",
    note: "Shaoguan",
    adcodes: [440200],
  },
];

function routesForRegion(regionTitle: string, routes: StoryRoute[]) {
  const cityMap = regionCityMap[regionTitle];
  if (!cityMap) return [];

  const searchNames = [
    ...cityMap.en.map((c) => c.toLowerCase()),
    ...cityMap.zh,
  ];

  return routes.filter((route) => {
    const cityName = route.city;
    return (
      searchNames.includes(cityName) ||
      searchNames.includes(cityName.toLowerCase()) ||
      route.citySlugs.some((slug) => searchNames.includes(slug))
    );
  });
}

export function RoutesMegaMenu({ active }: { active: boolean }) {
  const { locale } = useLocale();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [routes, setRoutes] = useState<StoryRoute[]>([]);

  // Fetch routes on mount and locale change
  useEffect(() => {
    fetchRoutes(locale).then(setRoutes).catch(() => {});
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
          active ? "text-[var(--cinnabar)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        Routes
      </Link>

      <div className="invisible fixed left-0 top-[4.55rem] z-40 w-screen translate-y-3 border-y border-black/5 bg-[var(--paper-deep)] bg-grain opacity-0 shadow-[0_40px_100px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-400 group-hover/routes:visible group-hover/routes:translate-y-0 group-hover/routes:opacity-100 group-focus-within/routes:visible group-focus-within/routes:translate-y-0 group-focus-within/routes:opacity-100">
        <div className="mx-auto max-w-[82rem] px-10 py-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/5 pb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">Routes / Field Discovery</p>
            </div>
            <Link href="/routes" className="px-8 py-4 border border-[var(--river-deep)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] transition-all hover:bg-[var(--river-deep)] hover:text-white">
              View all routes
            </Link>
          </div>

          <div className="grid gap-x-10 gap-y-12 md:grid-cols-3 xl:grid-cols-5">
            {routeRegions.map((region) => {
              const regionRoutes = routesForRegion(region.title, routes);

              return (
                <motion.div
                  key={region.title}
                  className="group/region"
                  animate={{
                    scale: hoveredRegion === region.title ? 1.02 : 1,
                    opacity: hoveredRegion && hoveredRegion !== region.title ? 0.45 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={regionRoutes[0] ? `/routes/${regionRoutes[0].slug}` : "/routes"} className="block">
                    <div className="relative h-32 overflow-hidden bg-white border border-black/10 scrapbook-shadow transition group-hover/region:-translate-y-1">
                      {mapPaths ? (
                        <svg
                          viewBox={`0 0 ${mapPaths.width} ${mapPaths.height}`}
                          className="h-full w-full scale-110 grayscale-[0.2] opacity-80 group-hover/region:grayscale-0 group-hover/region:opacity-100 transition-all duration-500"
                          role="img"
                          aria-label={`${region.title} highlighted on Guangdong map`}
                        >
                          <title>{region.title}</title>
                          {mapPaths.paths.map((city) => (
                            <path
                              key={city.adcode}
                              d={city.path}
                              fill={region.adcodes.includes(city.adcode) ? "#b64235" : "#8a968d"}
                              stroke="#fff"
                              strokeWidth={region.adcodes.includes(city.adcode) ? 2 : 1.2}
                              opacity={1}
                              onMouseEnter={() => setHoveredRegion(region.title)}
                              onMouseLeave={() => setHoveredRegion(null)}
                            />
                          ))}
                        </svg>
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-[var(--muted)] handwritten">Loading Map...</div>
                      )}
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[var(--river-deep)] transition group-hover/region:text-[var(--cinnabar)]">
                      {region.title}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{region.note}</p>
                  </Link>
                  <div className="mt-6 space-y-3 border-t border-black/5 pt-4">
                    {regionRoutes.slice(0, 3).map((route) => (
                      <Link
                        key={route.slug}
                        href={`/routes/${route.slug}`}
                        className="group/link flex items-center gap-2 text-sm text-[var(--muted)] transition-all hover:translate-x-1 hover:text-[var(--cinnabar)]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[var(--gold)]/40 group-hover/link:bg-[var(--cinnabar)]" />
                        <span className="handwritten whitespace-nowrap overflow-hidden text-ellipsis">{route.title}</span>
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
