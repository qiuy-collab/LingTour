"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";
import type { CityCulture } from "@/data/culture";

type Props = {
  allCities: CityCulture[];
  currentCity: CityCulture;
};

export function RelatedCitiesHub({ allCities, currentCity }: Props) {
  const [hoveredCitySlug, setHoveredCitySlug] = useState<string | null>(null);
  const features = useMemo(() => getMapFeatures(), []);

  const relatedCities = useMemo(
    () =>
      currentCity.relatedCitySlugs
        .map((slug) => allCities.find((city) => city.slug === slug))
        .filter((city): city is CityCulture => city != null),
    [allCities, currentCity.relatedCitySlugs],
  );

  const highlightedAdcodes = useMemo(() => {
    const adcodes = new Set<number>([currentCity.adcode]);
    relatedCities.forEach((city) => adcodes.add(city.adcode));
    if (hoveredCitySlug) {
      const hovered = relatedCities.find((city) => city.slug === hoveredCitySlug);
      if (hovered) adcodes.add(hovered.adcode);
    }
    return adcodes;
  }, [currentCity.adcode, hoveredCitySlug, relatedCities]);

  const hoveredAdcode = useMemo(() => {
    if (!hoveredCitySlug) return null;
    return relatedCities.find((city) => city.slug === hoveredCitySlug)?.adcode ?? null;
  }, [hoveredCitySlug, relatedCities]);

  const mapData = useMemo(() => {
    if (!features.length) return null;
    const projection = buildProjection(features, 320, 240, 12);
    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((feature: CityFeature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
      })),
    };
  }, [features]);

  if (relatedCities.length === 0) {
    return (
      <p className="mt-8 text-sm text-[var(--muted)]">
        No linked cities yet. Add related cities in admin to build this journey cluster.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)] lg:gap-16">
      <div className="grid gap-7">
        {relatedCities.map((city, index) => {
          const isHovered = hoveredCitySlug === city.slug;
          return (
            <Reveal key={city.slug} delay={index * 80}>
              <Link
                href={`/culture/${city.slug}`}
                className={`group grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--line)] pb-7 transition-colors sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 ${isHovered ? "border-[var(--cinnabar)]" : "hover:border-[var(--gold)]"}`}
                onMouseEnter={() => setHoveredCitySlug(city.slug)}
                onMouseLeave={() => setHoveredCitySlug(null)}
                onFocus={() => setHoveredCitySlug(city.slug)}
                onBlur={() => setHoveredCitySlug(null)}
              >
                <div className="aspect-[4/5] overflow-hidden border-4 border-white bg-[var(--paper)] scrapbook-shadow">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url(${city.image})` }}
                  />
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {city.label}
                  </p>
                  <h3 className="mt-2 font-[family:var(--font-display)] text-2xl leading-[1.02] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-3xl">
                    {city.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {city.summary}
                  </p>
                  <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/40 underline-offset-4">
                    Read city
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <h3 className="font-[family:var(--font-display)] text-3xl leading-[1.02] text-[var(--river-deep)]">
            Connected places
          </h3>
          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-[var(--muted)]">
            A regional view of the places linked to {currentCity.name}.
          </p>
          <div className="relative mt-7 overflow-hidden border-[0.5rem] border-white bg-white scrapbook-shadow">
            {mapData ? (
              <div className="relative p-4">
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="w-full"
                  role="img"
                  aria-label={`Guangdong map highlighting cities connected to ${currentCity.name}`}
                >
                  <title>Connected cities around {currentCity.name}</title>
                  {mapData.paths.map((city) => {
                    const isCurrent = city.adcode === currentCity.adcode;
                    const isHovered = hoveredAdcode === city.adcode;
                    const isLinked = highlightedAdcodes.has(city.adcode);
                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        fill={isCurrent ? "#1f4b45" : isHovered ? "#9a6d2e" : isLinked ? "#b64235" : "#ccd6ce"}
                        stroke="#fff"
                        strokeWidth={isCurrent || isHovered ? 1.6 : 0.9}
                        opacity={isLinked ? 1 : 0.62}
                        className="transition-[fill,opacity] duration-300"
                      />
                    );
                  })}
                </svg>

                <motion.p
                  initial={{ opacity: 0.9, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)]"
                >
                  {currentCity.name} and {relatedCities.length} linked {relatedCities.length === 1 ? "city" : "cities"}.
                </motion.p>
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
