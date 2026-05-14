"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";
import type { Region } from "@/types/content";
import { mockEvents } from "@/data/mock/events";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

const initialFeatures = getMapFeatures();

interface Props {
  cities?: Pick<Region, "slug" | "name" | "adcode" | "label" | "summary" | "image" | "tags" | "gallery">[];
}

export function GuangdongMapSection({ cities }: Props) {
  const { locale } = useLocale();
  const showcase = cities ?? [];
  const focusCityByCode = useMemo(() => new Map(showcase.map((city) => [city.adcode, city])), [showcase]);
  const router = useRouter();
  const [features] = useState<CityFeature[]>(initialFeatures);
  const [activeCode, setActiveCode] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Events logic
  const events = mockEvents[locale];
  const eventsByCity = useMemo(() => {
    const map = new Map<number, typeof events[0]>();
    events.forEach(e => {
      if (!map.has(e.adcode)) map.set(e.adcode, e);
    });
    return map;
  }, [events]);

  const activeCity = focusCityByCode.get(activeCode ?? -1) ?? showcase[0] ?? { slug: "zhanjiang", name: "Zhanjiang", label: "Southern coast", summary: "", image: "", tags: [], adcode: 440800, gallery: [] };
  const activeEvent = activeCode ? eventsByCity.get(activeCode) : null;

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

    const projection = buildProjection(features, 1060, 640, { left: 100, right: 100, top: 50, bottom: 50 });

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
  const panelLead = activeCity.summary.replace(/^#{1,3}\s+/gm, "").replace(/\*{1,3}(.+?)\*{1,3}/g, "$1");

  return (
    <section className="site-container py-12 lg:py-20">
      <div className="mb-12 opacity-60">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
          {locale === "zh" ? "地理探索" : "Geographical Exploration"}
        </p>
        <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
          {locale === "zh" ? "在地图上，预见你的下一场文化盛宴" : "On the Map, Preview Your Next Cultural Feast"}
        </h2>
      </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[#fdfaf3] shadow-[var(--shadow-soft)] lg:min-h-[48rem]">
          {/* Info Overlay Card */}
          <div className="absolute left-6 top-6 z-20 w-52 overflow-hidden rounded-xl border border-[var(--line)] bg-white/95 shadow-lg backdrop-blur-sm">
            <Link href={`/culture/${activeCity.slug}`} className="block">
              <div
                className="flex h-24 items-end bg-cover bg-center p-4 transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${activeImage})` }}
              >
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">{panelEyebrow}</p>
                  <h3 className="mt-1 font-[family:var(--font-display)] text-xl leading-none text-white drop-shadow-sm">
                    {panelTitle}
                  </h3>
                </div>
              </div>
            </Link>
            <div className="border-t border-[var(--line)] p-3">
              {activeEvent ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cinnabar)]">
                    {activeEvent.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">{activeEvent.date}</p>
                </div>
              ) : (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{panelLead}</p>
              )}
              <div className="mt-3 flex gap-1.5">
                <Link
                  href={`/culture/${activeCity.slug}`}
                  className="flex-1 rounded-md border border-[var(--river-deep)]/20 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-[var(--river-deep)] transition hover:border-[var(--river-deep)]/50 hover:bg-[var(--river-deep)]/5"
                >
                  {locale === "zh" ? "城市故事" : "Story"}
                </Link>
                <Link
                  href={`/interpreting?city=${activeCity.slug}`}
                  className="flex-1 rounded-md bg-[var(--cinnabar)] py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--cinnabar)]/80"
                >
                  {locale === "zh" ? "预约口译" : "Book"}
                </Link>
              </div>
            </div>
          </div>

          <div className="relative h-[30rem] lg:absolute lg:inset-0 lg:h-auto">
            <div className="h-full w-full p-4 lg:p-12">
              {mapData ? (
                <svg
                  viewBox={`0 0 ${mapData.width} ${mapData.height}`}
                  className="h-full w-full"
                  role="img"
                >
                  <rect width={mapData.width} height={mapData.height} fill="#fdfaf3" />

                  {/* Decorative routes */}
                  <g opacity="0.3">
                    <path d="M120 528 C250 438 380 492 512 408 S760 346 908 246" fill="none" stroke="#d7cfc1" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M92 382 C244 330 302 244 420 236 S648 196 918 114" fill="none" stroke="#d7cfc1" strokeWidth="1" strokeDasharray="4 4" />
                  </g>

                  {/* City Paths */}
                  {mapData.paths.map((city) => {
                    const hasContent = focusCityByCode.has(city.adcode);
                    const hasEvent = eventsByCity.has(city.adcode);
                    const isActive = activeCode === city.adcode;

                    return (
                      <path
                        key={city.adcode}
                        d={city.path}
                        stroke="#fff"
                        strokeWidth={isActive ? 2 : 1}
                        opacity={hasContent || isActive ? 1 : 0.6}
                        className="transition-all duration-300"
                        style={{
                          fill: isActive
                            ? (hasEvent ? "#b64235" : "#24535e")
                            : hasContent
                              ? (hasEvent ? "#e69c94" : "#9fb39e")
                              : "#e2ded6",
                          cursor: hasContent ? "pointer" : "default",
                        }}
                        onMouseEnter={() => {
                          if (hasContent) setActiveCode(city.adcode);
                        }}
                        onClick={() => {
                          const focusCity = focusCityByCode.get(city.adcode);
                          if (focusCity) router.push(`/culture/${focusCity.slug}`);
                        }}
                      />
                    );
                  })}

                  {/* City Label Dots */}
                  {mapData.paths.map((city) => {
                    const focusCity = focusCityByCode.get(city.adcode);
                    if (!focusCity || !city.point) return null;
                    const [x, y] = city.point;
                    const isActive = activeCode === city.adcode;
                    const hasEvent = eventsByCity.has(city.adcode);

                    return (
                      <g
                        key={`${city.adcode}-dot`}
                        className="transition-all duration-300"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setActiveCode(city.adcode)}
                      >
                        {hasEvent && (
                          <circle cx={x} cy={y} r={isActive ? 12 : 8} fill="#b64235" opacity="0.2">
                            <animate attributeName="r" values={isActive ? "10;14;10" : "6;10;6"} dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 4 : 3}
                          fill={isActive ? (hasEvent ? "#d42621" : "#fff") : (hasEvent ? "#b64235" : "#66717d")}
                        />
                        <text
                          x={x + 10}
                          y={y + 4}
                          className={`pointer-events-none select-none font-bold transition-all duration-300 ${
                            isActive ? "opacity-100 translate-x-1" : "opacity-40"
                          }`}
                          style={{ fontSize: "12px", fill: "var(--night)" }}
                        >
                          {focusCity.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                  Loading Map...
                </div>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}

