"use client";

import { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchRouteBySlug, fetchRouteCommunityPosts } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { ErrorState, LoadingSpinner, useApiQuery } from "@/lib/use-api-query";
import { RouteBrief } from "@/components/routes/RouteBrief";
import { TimeAxisItinerary, type RouteStopTarget } from "@/components/routes/TimeAxisItinerary";
import { StickyComposeBar } from "@/components/routes/StickyComposeBar";
import type { StoryRoute } from "@/data/routes";

export function RouteDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale } = useLocale();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<StoryRoute>("route");
  const [composeTarget, setComposeTarget] = useState<RouteStopTarget | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const activeLocale = previewLocale ?? locale;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (previewLocale && previewLocale !== locale) {
      setLocale(previewLocale);
    }
  }, [locale, previewLocale, setLocale]);

  const { data: route, loading, error } = useApiQuery(
    () => fetchRouteBySlug(slug, activeLocale),
    [slug, activeLocale],
  );

  const lastRouteRef = useRef<StoryRoute | null>(null);
  if (route) {
    lastRouteRef.current = route;
  }

  const activeRoute = previewData ?? route ?? lastRouteRef.current;

  const { data: liveCommunityPosts } = useApiQuery(
    () =>
      activeRoute
        ? fetchRouteCommunityPosts({
            routeSlug: activeRoute.slug,
            routeTitle: activeRoute.title,
            locale: activeLocale,
          })
        : Promise.resolve([]),
    [activeRoute?.slug, activeRoute?.title, activeLocale],
  );

  if (!hydrated) return <LoadingSpinner text="Opening the route..." />;
  if (previewEnabled && !activeRoute) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeRoute) return <LoadingSpinner text="Opening the route..." />;

  if (error && !activeRoute) {
    return (
      <ErrorState
        title="Route file unavailable"
        message="This route's archive can't be reached right now. Please try again shortly."
      />
    );
  }

  if (!activeRoute) {
    notFound();
  }

  return (
    <>
      <div className="route-detail-shell relative min-h-screen w-full bg-[var(--background)] bg-grain">
        {/* Section A - Route Brief: marquee title, live position, thumb stack */}
        <RouteBrief route={activeRoute} />

        {/* Section B - Time-Axis Itinerary: continuous reader, no cards, no modal */}
        <TimeAxisItinerary
          stops={activeRoute.itinerary}
          routeStory={activeRoute.story}
          routeTitle={activeRoute.title}
          onAddStopNote={(stop, index) =>
            setComposeTarget({ index, time: stop.time, name: stop.stop })
          }
        />
      </div>

      {/* Section C - Sticky Compose Bar: pinned to viewport bottom. Kept as a
          sibling of the shell (not inside) so its `position: fixed` container
          isn't accidentally caught by any `main > div` style rules and forced
          to full viewport height. */}
      <StickyComposeBar
        routeSlug={activeRoute.slug}
        routeTitle={activeRoute.title}
        routeCity={activeRoute.city}
        initialPosts={liveCommunityPosts ?? []}
        composeTarget={composeTarget}
        onClearTarget={() => setComposeTarget(null)}
      />
    </>
  );
}
