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
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-6">
        {relatedCities.map((city, index) => {
          const isHovered = hoveredCitySlug === city.slug;
          return (
            <Reveal key={city.slug} delay={index * 80}>
              <Link
                href={`/culture/${city.slug}`}
                className={`group relative grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border border-[var(--line)] bg-white p-4 transition-all duration-300 scrapbook-shadow sm:grid-cols-[120px_1fr] sm:gap-5 sm:p-5 ${isHovered ? "border-[var(--cinnabar)]" : "hover:border-[var(--gold)]"}`}
                onMouseEnter={() => setHoveredCitySlug(city.slug)}
                onMouseLeave={() => setHoveredCitySlug(null)}
              >
                <div
                  className="h-full min-h-28 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-[var(--river-deep)] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                      {city.label}
                    </span>
                    <span className="text-[11px] font-medium tracking-wider text-[var(--muted)]">
                      {city.adcode}
                    </span>
                  </div>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)]">
                    {city.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {city.summary}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-label text-[var(--cinnabar)] handwritten">City linkage</p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
            Places connected to {currentCity.name}
          </h3>
          <div className="relative mt-8 overflow-hidden border-8 border-white bg-white scrapbook-shadow">
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
                        fill={isCurrent ? "#1f4b45" : isHovered ? "#d97706" : isLinked ? "#b64235" : "#ccd6ce"}
                        stroke="#fff"
                        strokeWidth={isCurrent || isHovered ? 1.6 : 0.9}
                        opacity={isLinked ? 1 : 0.62}
                        className="transition-[fill,opacity] duration-300"
                      />
                    );
                  })}
                </svg>

                <motion.div
                  initial={{ opacity: 0.9, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-4 mb-4 border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-label text-[var(--cinnabar)]">Current city</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-lg leading-tight text-[var(--river-deep)]">
                    {currentCity.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Linked cities: {relatedCities.length}
                  </p>
                </motion.div>
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
