"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";
import type { Region } from "@/types/content";

const initialFeatures = getMapFeatures();

interface Props {
  cities?: Pick<Region, "slug" | "name" | "adcode" | "label" | "summary" | "image" | "tags" | "gallery">[];
}

export function GuangdongMapSection({ cities }: Props) {
  const showcase = cities ?? [];
  const focusCityByCode = useMemo(() => new Map(showcase.map((city) => [city.adcode, city])), [showcase]);
  const router = useRouter();
  const [features] = useState<CityFeature[]>(initialFeatures);
  const [activeCode, setActiveCode] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const activeCity = focusCityByCode.get(activeCode ?? -1) ?? showcase[0] ?? { slug: "zhanjiang", name: "Zhanjiang", label: "Southern coast", summary: "", image: "", tags: [], adcode: 440800, gallery: [] };
  const activeGallery = activeCity.gallery && activeCity.gallery.length ? activeCity.gallery : [activeCity.image];
  const activeImage = activeGallery[slideIndex % activeGallery.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((index) => index + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const mapData = useMemo(() => {
    if (!features.length) {
      return null;
    }

    const projection = buildProjection(features, 1060, 640, { left: 300, right: 70, top: 78, bottom: 78 });

    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((feature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
        point: feature.properties.centroid ? projection.point(feature.properties.centroid) : null,
      })),
    };
  }, [features]);

  const panelTitle = activeCity.name;
  const panelEyebrow = activeCity.label;
  const panelLead = activeCity.summary;

  return (
    <section className="py-12 lg:py-24">
      <div className="site-container">
        <div className="mb-9 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Discover Guangdong</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Choose a city, then follow the story behind it.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
            The map uses real Guangdong city boundaries. Hover a city to connect geography with cultural
            routes, interpretation support, and the images visitors remember first.
          </p>
        </div>

        <div className="relative overflow-hidden border border-[var(--line)] bg-[#fdfaf3] shadow-[var(--shadow-soft)] lg:min-h-[46rem]">
          <Link
            href={`/culture/${activeCity.slug}`}
            className="group relative z-10 m-4 block overflow-hidden bg-[rgba(17,25,35,0.92)] text-white shadow-[0_22px_70px_rgba(17,25,35,0.22)] backdrop-blur-md sm:w-[min(100%,16.5rem)] lg:absolute lg:left-7 lg:top-8 lg:m-0"
          >
            <div
              className="image-sheen flex h-[8.75rem] items-end bg-cover bg-center p-4 transition duration-500 group-hover:scale-[1.02]"
              style={{ backgroundImage: `url(${activeImage})` }}
            >
              <div className="relative z-10">
                <p className="text-label text-white/62">{panelEyebrow}</p>
                <h3 className="mt-2 font-[family:var(--font-display)] text-3xl leading-none">
                  {panelTitle}
                </h3>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-xs leading-6 text-white/78">{panelLead}</p>
              <div className="flex gap-1.5">
                {activeGallery.map((image, index) => (
                  <span
                    key={image}
                    className={`h-1 w-6 transition ${
                      index === slideIndex % activeGallery.length ? "bg-white" : "bg-white/28"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Link>

          <div className="relative h-[25rem] lg:absolute lg:inset-0 lg:h-auto">
            <div className="h-full w-full p-4 lg:p-8">
              {mapData ? (
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="h-full w-full"
                  role="img"
                  aria-label="Interactive map of Guangdong cities"
                >
                  <title>Interactive map of Guangdong cities</title>
                  <rect width={mapData.width} height={mapData.height} fill="#fdfaf3" />
                  <g opacity="0.42">
                    <path d="M120 528 C250 438 380 492 512 408 S760 346 908 246" fill="none" stroke="#d7cfc1" />
                    <path d="M92 382 C244 330 302 244 420 236 S648 196 918 114" fill="none" stroke="#d7cfc1" />
                  </g>
                  {mapData.paths.map((city) => {
                    const hasContent = focusCityByCode.has(city.adcode);
                    const isActive = activeCode === city.adcode;

                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        stroke="#fffaf1"
                        strokeWidth={isActive ? 2.4 : 1.2}
                        opacity={hasContent || isActive ? 1 : 0.72}
                        style={{
                          fill: isActive ? "#b64235" : hasContent ? "#9fb39e" : "#d8d0c2",
                          cursor: hasContent ? "pointer" : "default",
                          transition: "fill 200ms",
                        }}
                        onMouseEnter={() => {
                          if (hasContent) {
                            setActiveCode(city.adcode);
                          }
                        }}
                        onClick={() => {
                          const focusCity = focusCityByCode.get(city.adcode);
                          if (focusCity) {
                            router.push(`/culture/${focusCity.slug}`);
                          }
                        }}
                      />
                    );
                  })}
                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);
                    if (!focusCity || !city.point) return null;
                    const [x, y] = city.point;
                    const isActive = activeCode === city.adcode;
                    return (
                      <g
                        key={`${city.adcode}-link`}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setActiveCode(city.adcode)}
                        onClick={() => router.push(`/culture/${focusCity.slug}`)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 4.5 : 3.2}
                          style={{ fill: isActive ? "#d42621" : "#9d9b95", transition: "fill 200ms" }}
                        />
                      </g>
                    );
                  })}
                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);

                    if (!focusCity || !city.point) {
                      return null;
                    }

                    const [x, y] = city.point;

                    return (
                      <g key={`${city.adcode}-label`} pointerEvents="none">
                        <text
                          x={x + 8}
                          y={y - 8}
                          style={{ fill: "var(--night)", fontSize: "12px", fontWeight: "600" }}
                        >
                          {focusCity.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex min-h-[24rem] items-center justify-center text-sm text-[var(--muted)]">
                  Loading Guangdong city boundaries
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
