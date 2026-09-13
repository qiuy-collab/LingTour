"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/locale-context";
import {
  getMapFeatures,
  buildProjection,
  featureToPath,
} from "@/lib/map-projection";
import { fetchRouteRegions, fetchRoutes } from "@/lib/api-data";
import type { StoryRoute } from "@/data/routes";
import {
  DEFAULT_ROUTE_REGIONS,
  pickRouteRegionText,
  type RouteRegion,
} from "@/lib/route-regions";

const initialFeatures = getMapFeatures();

export function RoutesMegaMenu({ active }: { active: boolean }) {
  const { t } = useLocale();
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [routes, setRoutes] = useState<StoryRoute[]>([]);
  const [routeRegions, setRouteRegions] =
    useState<RouteRegion[]>(DEFAULT_ROUTE_REGIONS);
  const [routesReady, setRoutesReady] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadMenuData = useCallback(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void Promise.allSettled([fetchRoutes(), fetchRouteRegions()]).then(
      ([routesResult, regionsResult]) => {
        if (routesResult.status === "fulfilled") {
          setRoutes(routesResult.value);
        }
        if (regionsResult.status === "fulfilled") {
          setRouteRegions(
            regionsResult.value.length
              ? regionsResult.value
              : DEFAULT_ROUTE_REGIONS,
          );
        }
        setRoutesReady(true);
      },
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMenuData();
    }
  }, [isOpen, loadMenuData]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      window.requestAnimationFrame(() => toggleRef.current?.focus());
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

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

  function closeMenu() {
    setIsOpen(false);
    setActiveRegion(null);
  }

  return (
    <div
      ref={rootRef}
      className="relative flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => closeMenu()}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeMenu();
        }
      }}
    >
      <Link
        href="/routes"
        className={`px-3 py-3 text-sm transition ${
          active
            ? "text-[var(--cinnabar)]"
            : "text-[var(--muted)] hover:text-[var(--ink)]"
        }`}
        aria-current={active ? "page" : undefined}
        onFocus={() => {
          setIsOpen(true);
          loadMenuData();
        }}
        onClick={closeMenu}
      >
        {t("common.nav.routes")}
      </Link>
      <button
        ref={toggleRef}
        type="button"
        data-routes-menu-toggle
        className="group/toggle ml-1 inline-flex h-11 w-11 items-center justify-center border-l border-[var(--line)] text-[var(--muted)] transition-colors hover:text-[var(--cinnabar)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
        aria-label={
          isOpen
            ? t("common.nav.routesMega.close")
            : t("common.nav.routesMega.open")
        }
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          aria-hidden="true"
          data-routes-disclosure-mark
          className={`relative block h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-45 scale-110 text-[var(--cinnabar)]" : ""
          }`}
        >
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          aria-busy={!routesReady}
          className="fixed left-0 top-[4.55rem] z-40 max-h-[calc(100dvh-4.55rem)] w-screen overflow-y-auto overscroll-contain border-y border-black/5 bg-[var(--paper-deep)] bg-grain shadow-[0_40px_100px_rgba(0,0,0,0.15)] backdrop-blur-xl"
        >
          <div className="mx-auto max-w-[82rem] px-6 py-8 lg:px-10 lg:py-12">
            <div className="mb-8 flex items-center justify-between gap-8 border-b border-black/5 pb-7 lg:mb-12 lg:pb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                {t("common.nav.routesMega.eyebrow")}
              </p>
              <Link
                href="/routes"
                className="inline-flex min-h-11 shrink-0 items-center px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] transition-colors hover:bg-[var(--river-deep)] hover:text-white"
                onClick={closeMenu}
              >
                {t("common.nav.routesMega.viewAll")}
              </Link>
            </div>

            <div className="grid gap-x-10 gap-y-12 md:grid-cols-3 xl:grid-cols-5">
              {routeRegions.map((region) => {
                const regionRoutes = routes.filter(
                  (route) => route.routeRegionKey === region.key,
                );
                const regionTitle = pickRouteRegionText(region.title);
                const regionNote = pickRouteRegionText(region.note);

                return (
                  <motion.div
                    key={region.key}
                    className="group/region min-w-0"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: activeRegion === region.key ? 1.015 : 1,
                            opacity:
                              activeRegion && activeRegion !== region.key
                                ? 0.58
                                : 1,
                          }
                    }
                    transition={{
                      duration: reduceMotion ? 0 : 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onMouseEnter={() => setActiveRegion(region.key)}
                    onMouseLeave={() => setActiveRegion(null)}
                    onFocusCapture={() => setActiveRegion(region.key)}
                    onBlurCapture={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setActiveRegion(null);
                      }
                    }}
                  >
                    <Link
                      href={`/routes?region=${region.key}`}
                      className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
                      onClick={closeMenu}
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
                              />
                            ))}
                          </svg>
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-[var(--muted)] handwritten">
                            {t("common.nav.routesMega.loadingMap")}
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
                      {regionRoutes.length ? (
                        regionRoutes.slice(0, 3).map((route) => (
                          <Link
                            key={route.slug}
                            href={`/routes/${route.slug}`}
                            className="group/link flex min-h-11 items-center gap-2 text-sm text-[var(--muted)] transition-all hover:translate-x-1 hover:text-[var(--cinnabar)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
                            onClick={closeMenu}
                          >
                            <span className="h-1 w-1 rounded-full bg-[var(--gold)]/40 group-hover/link:bg-[var(--cinnabar)]" />
                            <span className="handwritten overflow-hidden text-ellipsis whitespace-nowrap">
                              {route.title}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-[var(--muted)] handwritten">
                          {t("common.nav.routesMega.comingSoon")}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
