"use client";

import { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchRouteBySlug, fetchRouteCommunityPosts } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { RouteBrief } from "@/components/routes/RouteBrief";
import { TimeAxisItinerary, type RouteStopTarget } from "@/components/routes/TimeAxisItinerary";
import { StickyComposeBar } from "@/components/routes/StickyComposeBar";
import type { StoryRoute } from "@/data/routes";

export function RouteDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale } = useLocale();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<StoryRoute>("route");

  const [composeTarget, setComposeTarget] = useState<RouteStopTarget | null>(null);

  const activeLocale = previewLocale ?? locale;

  useEffect(() => {
    if (previewLocale && previewLocale !== locale) {
      setLocale(previewLocale);
    }
  }, [locale, previewLocale, setLocale]);

  const { data: route, loading, error } = useApiQuery(
    () => fetchRouteBySlug(slug, activeLocale),
    [slug, activeLocale],
  );

  // Cache the last successful route so locale switches / refetches
  // don't blank the page during the brief in-flight window.
  const lastRouteRef = useRef<StoryRoute | null>(null);
  if (route) lastRouteRef.current = route;

  const activeRoute = previewData ?? route ?? lastRouteRef.current;

  // Pull live community posts attached to this route (filtered by route title)
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

  if (previewEnabled && !activeRoute) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeRoute) return <LoadingSpinner text="Opening the route..." />;

  // If there's a hard error AND we have no cached route to fall back on,
  // show the error state so the user can retry — never auto-redirect.
  if (error && !activeRoute) {
    return (
      <ErrorState
        title="Route file unavailable"
        message="This route's archive can't be reached right now. Please try again shortly."
      />
    );
  }

  // Truly nothing to show (slug doesn't exist server-side either) — render
  // the framework's not-found page so the URL returns a real 404.
  if (!activeRoute) {
    notFound();
  }

  return (
    <>
      <main className="bg-[var(--background)] min-h-screen">
        {/* Section A — Route Brief: marquee title, live position, thumb stack */}
        <RouteBrief route={activeRoute} />

        {/* Section B — Time-Axis Itinerary: continuous reader, no cards, no modal */}
        <TimeAxisItinerary
          stops={activeRoute.itinerary}
          routeStory={activeRoute.story}
          routeTitle={activeRoute.title}
          onAddStopNote={(stop, index) =>
            setComposeTarget({ index, time: stop.time, name: stop.stop })
          }
        />
      </main>

      {/* Section C — Sticky Compose Bar: real-time post box pinned to viewport.
          Rendered OUTSIDE <main> on purpose: globals.css has a `main > div`
          rule that forces min-height: 100vh on every direct div child of
          <main> (it's there for the page-transition wrapper). If the sticky
          bar lived inside <main>, it would be force-stretched to the full
          viewport and obscure the entire page. */}
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
