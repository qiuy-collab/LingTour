"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchRouteBySlug } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { IntroHero } from "@/components/routes/IntroHero";
import { ScrollStoryRoute } from "@/components/routes/ScrollStoryRoute";
import { MobileStickyActions } from "@/components/layout/MobileStickyActions";
import type { StoryRoute } from "@/data/routes";

export function RouteDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<StoryRoute>("route");

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

  const activeRoute = previewData ?? route;

  if (previewEnabled && !activeRoute) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeRoute) return <LoadingSpinner text="Opening the route..." />;
  if (error && !activeRoute) return <ErrorState message={error} />;

  if (!activeRoute) {
    router.push("/routes");
    return null;
  }

  return (
    <main className="bg-[var(--background)] bg-grain min-h-screen">
      <IntroHero title={activeRoute.title} summary={activeRoute.summary} image={activeRoute.image} />

      <ScrollStoryRoute
        stops={activeRoute.itinerary}
        routeTitle={activeRoute.title}
        routeStory={activeRoute.story}
        routeImage={activeRoute.image}
      />

      <section className="py-24 lg:py-32">
        <div className="site-container">
          <div className="relative overflow-hidden border-8 border-white bg-[var(--river-deep)] px-8 py-20 text-center text-white scrapbook-shadow lg:px-24 lg:py-32">
            <div className="absolute inset-0 bg-grain opacity-[0.05]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.15),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)] handwritten">
                Complete the experience
              </p>
              <h2 className="mt-8 font-[family:var(--font-display)] text-4xl leading-[1.1] md:text-6xl">
                Turn the route into a <span className="italic text-[var(--gold)]">personal archive.</span>
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-white/70 handwritten">
                Add a local interpreter for timing, context, and the small explanations that turn a simple path into a lifelong memory.
              </p>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                <Link
                  href="/interpreting"
                  className="btn-gold"
                >
                  Request Dispatch
                </Link>
                <Link
                  href="/routes"
                  className="inline-block border border-white/30 bg-white/5 px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  Browse Atlas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileStickyActions
        actions={[
          { label: "Book This Route", href: "/interpreting#booking", variant: "primary" },
          { label: "More Routes", href: "/routes", variant: "secondary" },
        ]}
      />
    </main>
  );
}
