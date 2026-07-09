"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMapFeatures,
  buildProjection,
  featureToPath,
  type CityFeature,
} from "@/lib/map-projection";
import type { EventData } from "@/lib/api-data";
import type { Region } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";

const initialFeatures = getMapFeatures();

interface Props {
  cities?: Pick<
    Region,
    | "slug"
    | "name"
    | "adcode"
    | "label"
    | "summary"
    | "image"
    | "tags"
    | "gallery"
  >[];
  events?: EventData[];
}

export function GuangdongMapSection({ cities, events = [] }: Props) {
  const router = useRouter();
  const showcase = useMemo(() => cities ?? [], [cities]);
  const defaultActiveCode = showcase[0]?.adcode ?? 440800;
  const focusCityByCode = useMemo(
    () => new Map(showcase.map((city) => [city.adcode, city])),
    [showcase],
  );
  const [features] = useState<CityFeature[]>(initialFeatures);
  const [activeCode, setActiveCode] = useState<number>(defaultActiveCode);
  const [slideIndex, setSlideIndex] = useState(0);
  const lastTouchedRef = useRef<number | null>(null);

  const eventsByCity = useMemo(() => {
    const map = new Map<number, (typeof events)[number]>();
    events.forEach((event) => {
      const city = showcase.find((item) => item.slug === event.citySlug);
      const cityCode = city?.adcode;
      if (cityCode && !map.has(cityCode)) map.set(cityCode, event);
    });
    return map;
  }, [events, showcase]);

  const fallbackCity = {
    slug: "zhanjiang",
    name: "Zhanjiang",
    label: "Southern coast",
    summary: "",
    image: "/uploads/seed/zhanjiang-hero-1200.jpg",
    tags: [],
    adcode: 440800,
    gallery: [],
  };

  const activateCity = (adcode: number) => {
    setActiveCode(adcode);
    setSlideIndex(0);
  };

  const openCity = (adcode: number) => {
    const city = focusCityByCode.get(adcode);
    if (!city) return;
    activateCity(adcode);
    router.push(`/culture/${city.slug}`);
  };

  /** On touch devices: first tap activates (like hover), second tap navigates. */
  const handleTouchTap = (adcode: number) => {
    if (lastTouchedRef.current === adcode) {
      lastTouchedRef.current = null;
      openCity(adcode);
    } else {
      lastTouchedRef.current = adcode;
      activateCity(adcode);
    }
  };

  /** Prevent 300ms tap delay on touch devices. */
  const handleTouchStart = () => {
    // Intentionally empty — onTouchStart itself triggers the fast-tap path.
  };

  const resolvedActiveCode = focusCityByCode.has(activeCode)
    ? activeCode
    : defaultActiveCode;
  const activeCity =
    focusCityByCode.get(resolvedActiveCode) ?? showcase[0] ?? fallbackCity;
  const activeEvent = eventsByCity.get(resolvedActiveCode) ?? null;
  const activeGallery =
    activeCity.gallery && activeCity.gallery.length
      ? activeCity.gallery
      : [activeCity.image].filter(Boolean);
  const activeImage =
    activeGallery[slideIndex % Math.max(activeGallery.length, 1)] ??
    fallbackCity.image;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((index) => index + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const mapData = useMemo(() => {
    if (!features.length) return null;

    const projection = buildProjection(features, 1060, 640, {
      left: 100,
      right: 100,
      top: 50,
      bottom: 50,
    });

    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((feature) => ({
        adcode: feature.properties.adcode,
        path: featureToPath(feature, projection.point),
        point: feature.properties.centroid
          ? projection.point(feature.properties.centroid)
          : null,
      })),
    };
  }, [features]);

  const panelTitle = activeCity.name;
  const panelEyebrow = activeCity.label;
  const panelLead = activeCity.summary
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*{1,3}(.+?)\*{1,3}/g, "$1");

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-40">
      <div className="site-container relative z-10">
        <div className="mb-8 sm:mb-12 lg:mb-20">
          <Reveal>
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-10 bg-[var(--cinnabar)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                Geographical Exploration
              </p>
            </div>
            <h2 className="max-w-4xl font-[family:var(--font-display)] text-[3.2rem] leading-[0.94] tracking-[-0.04em] text-[var(--river-deep)] sm:text-5xl md:text-7xl lg:text-8xl">
              On the Map, Preview Your Next Feast.
            </h2>
          </Reveal>
        </div>

        <div className="relative">
          <div className="scrapbook-shadow relative z-30 mx-auto mb-6 w-full max-w-[19rem] border-[0.4rem] border-white bg-white/95 p-3 backdrop-blur-sm sm:max-w-[22rem] md:absolute md:left-0 md:top-0 md:mx-0 md:mb-0 md:w-56 md:max-w-sm md:rotate-1 md:border-8 md:p-4 lg:w-52">
            <Reveal delay={400}>
              <Link
                href={`/culture/${activeCity.slug}`}
                className="group block"
              >
                <div className="relative mb-3 aspect-[16/10] overflow-hidden md:mb-4 md:aspect-[4/3]">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={activeCity.name}
                      loading="eager"
                      decoding="sync"
                      fetchPriority="high"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,52,61,0.14),rgba(182,66,53,0.08))]" />
                  )}
                  <div className="absolute -top-2 left-1/2 z-20 h-6 w-20 -translate-x-1/2 rotate-2 bg-white/40 backdrop-blur-sm" />
                </div>
              </Link>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {panelEyebrow}
                  </p>
                  <h3 className="font-[family:var(--font-display)] text-[1.75rem] italic leading-none text-[var(--river-deep)] md:text-2xl">
                    {panelTitle}
                  </h3>
                </div>

                <div className="h-px bg-[var(--line)]" />

                <div className="min-h-[3.5rem] md:min-h-[4.5rem]">
                  {activeEvent ? (
                    <div className="animate-reveal">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--cinnabar)]">
                        {activeEvent.title}
                      </p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {activeEvent.date}
                      </p>
                    </div>
                  ) : (
                    <p className="handwritten line-clamp-4 text-sm leading-relaxed text-[var(--muted)]">
                      {panelLead}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 md:pt-2">
                  <Link
                    href={`/culture/${activeCity.slug}`}
                    className="border border-[var(--river-deep)] py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-[var(--river-deep)] transition-all hover:bg-[var(--river-deep)] hover:text-white md:py-3"
                  >
                    Story
                  </Link>
                  <Link
                    href={`/interpreting?city=${activeCity.slug}`}
                    className="bg-[var(--cinnabar)] py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[var(--cinnabar-deep)] md:py-3"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="relative z-10 h-[18rem] overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--background)] sm:h-[24rem] md:h-[28rem] md:rounded-none md:border-0 md:bg-transparent lg:h-[40rem]">
            <div className="pointer-events-auto h-full w-full opacity-60">
              {mapData ? (
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="h-full w-full"
                  role="img"
                >
                  <rect
                    width={mapData.width}
                    height={mapData.height}
                    fill="var(--background)"
                  />

                  <g opacity="0.6">
                    <path
                      d="M120 528 C250 438 380 492 512 408 S760 346 908 246"
                      fill="none"
                      stroke="#444b54"
                      strokeWidth="1"
                      strokeDasharray="6 6"
                    />
                    <path
                      d="M92 382 C244 330 302 244 420 236 S648 196 918 114"
                      fill="none"
                      stroke="#444b54"
                      strokeWidth="1"
                      strokeDasharray="6 6"
                    />
                  </g>

                  {mapData.paths.map((city) => {
                    const hasContent = focusCityByCode.has(city.adcode);
                    const hasEvent = eventsByCity.has(city.adcode);
                    const isActive = resolvedActiveCode === city.adcode;

                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        stroke="#fff"
                        strokeWidth={isActive ? 2 : 1}
                        opacity={hasContent || isActive ? 1 : 0.8}
                        className="transition-all duration-500"
                        style={{
                          fill: isActive
                            ? hasEvent
                              ? "#b64235"
                              : "#14343d"
                            : hasContent
                              ? hasEvent
                                ? "rgba(182, 66, 53, 0.8)"
                                : "rgba(20, 52, 61, 0.45)"
                              : "rgba(102, 113, 125, 0.25)",
                          cursor: hasContent ? "pointer" : "default",
                        }}
                        onMouseEnter={() => {
                          if (hasContent) activateCity(city.adcode);
                        }}
                        onTouchStart={handleTouchStart}
                        onClick={() => {
                          if (hasContent) handleTouchTap(city.adcode);
                        }}
                      />
                    );
                  })}

                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);
                    if (!focusCity || !city.point) return null;
                    const [x, y] = city.point;
                    const isActive = resolvedActiveCode === city.adcode;
                    const hasEvent = eventsByCity.has(city.adcode);

                    return (
                      <g
                        key={`${city.adcode}-dot`}
                        className="transition-all duration-300"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => activateCity(city.adcode)}
                        onTouchStart={handleTouchStart}
                        onClick={() => handleTouchTap(city.adcode)}
                      >
                        {hasEvent ? (
                          <circle
                            cx={x}
                            cy={y}
                            r={isActive ? 15 : 10}
                            fill="#b64235"
                            opacity="0.1"
                          >
                            <animate
                              attributeName="r"
                              values={isActive ? "12;18;12" : "8;12;8"}
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        ) : null}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 3 : 2}
                          fill={isActive ? "#b64235" : "var(--river-deep)"}
                        />
                        <text
                          x={x + 12}
                          y={y + 4}
                          className={`pointer-events-none select-none font-[family:var(--font-display)] italic transition-all duration-500 ${
                            isActive
                              ? "opacity-100 translate-x-2"
                              : "opacity-0 -translate-x-2"
                          }`}
                          style={{
                            fontSize: "16px",
                            fill: "var(--river-deep)",
                          }}
                        >
                          {focusCity.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="handwritten flex h-full items-center justify-center text-sm text-[var(--muted)]">
                  Drawing Atlas...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
