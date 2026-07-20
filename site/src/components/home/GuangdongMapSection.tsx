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
import { useLocale } from "@/lib/locale-context";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

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
  const { t } = useLocale();
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
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

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

  useGSAP(
    () => {
      if (!mobilePanelRef.current) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          mobilePanelRef.current,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: motionEase.enter,
            clearProps: "opacity,transform,visibility",
          },
        );
      });

      return () => media.revert();
    },
    {
      scope: mobilePanelRef,
      dependencies: [resolvedActiveCode],
      revertOnUpdate: true,
    },
  );

  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-14 lg:pb-40 lg:pt-24">
      <div className="site-container relative z-10">
        <div className="mb-8 sm:mb-12 lg:mb-20">
          <Reveal>
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-10 bg-[var(--cinnabar)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                {t("home.map.eyebrow")}
              </p>
            </div>
            <h2 className="max-w-4xl font-[family:var(--font-display)] text-[clamp(2.5rem,11vw,3.6rem)] leading-[0.94] tracking-[-0.04em] text-[var(--river-deep)] md:text-7xl lg:text-8xl">
              {t("home.map.heading")}
            </h2>
          </Reveal>
        </div>

        <div className="relative">
          <div className="scrapbook-shadow relative z-30 hidden border-white bg-white/95 backdrop-blur-sm md:absolute md:left-0 md:top-0 md:block md:w-56 md:max-w-sm md:rotate-1 md:border-8 md:p-4 lg:w-52">
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
                  <p className="handwritten line-clamp-4 text-sm leading-relaxed text-[var(--muted)]">
                    {panelLead}
                  </p>
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

          <div className="relative z-10 h-[18rem] overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--background)] min-[430px]:h-[20rem] sm:h-[22rem] md:h-[28rem] md:rounded-none md:border-0 md:bg-transparent lg:h-[40rem]">
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
                        strokeWidth={isActive ? (hasEvent ? 2 : 1.5) : 1}
                        opacity={1}
                        className="transition-all duration-500"
                        style={{
                          fill: isActive
                            ? hasEvent
                              ? "#b64235"
                              : "#c97a6e"
                            : hasContent || hasEvent
                              ? "rgba(182, 66, 53, 0.6)"
                              : "rgba(182, 66, 53, 0.15)",
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

          <div
            ref={mobilePanelRef}
            className="relative z-30 mx-3 -mt-12 grid min-w-0 grid-cols-[5.75rem_minmax(0,1fr)] gap-3 border-[0.35rem] border-white bg-[rgba(248,246,239,0.96)] p-2.5 shadow-[0_16px_35px_rgba(20,52,61,0.14)] backdrop-blur-sm md:hidden"
          >
            <Link
              href={`/culture/${activeCity.slug}`}
              className="relative aspect-square min-w-0 overflow-hidden bg-[var(--line)]"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={activeCity.name}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </Link>

            <div className="flex min-w-0 flex-col justify-center py-0.5">
              <p className="truncate text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {panelEyebrow}
              </p>
              <div className="mt-1 flex min-w-0 items-baseline justify-between gap-2">
                <h3 className="truncate font-[family:var(--font-display)] text-[1.55rem] italic leading-none text-[var(--river-deep)]">
                  {panelTitle}
                </h3>
                <Link
                  href={`/culture/${activeCity.slug}`}
                  aria-label={`Open ${activeCity.name} story`}
                  className="shrink-0 text-xl leading-none text-[var(--cinnabar)] transition-transform duration-300 hover:translate-x-1"
                >
                  →
                </Link>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">
                {panelLead}
              </p>
            </div>
          </div>

          {showcase.length > 1 ? (
            <div className="scrollbar-hide -mx-4 mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:hidden">
              {showcase.map((city, index) => {
                const isActive = city.adcode === resolvedActiveCode;
                return (
                  <button
                    key={city.adcode}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => activateCity(city.adcode)}
                    className={`snap-start whitespace-nowrap border-b pb-2 text-left transition-colors ${
                      isActive
                        ? "border-[var(--cinnabar)] text-[var(--river-deep)]"
                        : "border-[var(--line)] text-[var(--muted)]"
                    }`}
                  >
                    <span className="mr-2 text-[8px] font-bold tracking-[0.18em] text-[var(--gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-[family:var(--font-display)] text-base italic">
                      {city.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
