"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchRouteBySlug } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { IntroHero } from "@/components/routes/IntroHero";
import { ScrollStoryRoute } from "@/components/routes/ScrollStoryRoute";
import { MobileStickyActions } from "@/components/layout/MobileStickyActions";

export function RouteDetailClient({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const router = useRouter();

  const { data: route, loading, error } = useApiQuery(
    () => fetchRouteBySlug(slug, locale),
    [slug, locale],
  );

  if (loading) return <LoadingSpinner text="Opening the route..." />;
  if (error) return <ErrorState message={error} />;

  if (!route) {
    router.push("/routes");
    return null;
  }

  return (
    <main className="bg-[var(--paper-deep)]">
      <IntroHero title={route.title} summary={route.summary} image={route.image} />

      <ScrollStoryRoute
        stops={route.itinerary}
        routeTitle={route.title}
        routeStory={route.story}
        routeImage={route.image}
      />

      <section className="py-16 lg:py-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                Make it yours
              </p>
              <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                Turn the route into a day that moves at your pace.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/58">
                Add a local interpreter for timing, context, and the small explanations that turn a route into a memory.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/interpreting"
                  className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
                >
                  Plan interpreting
                </Link>
                <Link
                  href="/routes"
                  className="inline-block border border-white/20 px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-white/40 hover:bg-white/5"
                >
                  Browse more routes
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
