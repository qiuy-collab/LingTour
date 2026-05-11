"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchRouteBySlug, fetchCities } from "@/lib/api-data";
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

  const { data: allCities } = useApiQuery(
    () => fetchCities(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Loading route…" />;
  if (error) return <ErrorState message={error} />;

  if (!route) {
    router.push("/routes");
    return null;
  }

  const cityCultures = allCities ?? [];
  const relatedCities = route.citySlugs
    .map((cs) => cityCultures.find((c) => c.slug === cs))
    .filter(Boolean);

  return (
    <main style={{ background: "var(--route-bg)" }}>
      {/* ═══════ PAGE 1: IMMERSIVE HERO ═══════ */}
      <IntroHero
        title={route.title}
        summary={route.summary}
        image={route.image}
      />

      {/* ═══════ PAGE 2: SCROLL ROUTE + STAGGERED CARDS ═══════ */}
      <ScrollStoryRoute
        stops={route.itinerary}
        routeTitle={route.title}
        routeStory={route.story}
        routeImage={route.image}
      />

      {/* ═══════ CITIES PASSED THROUGH ═══════ */}
      {relatedCities.length > 0 && (
        <section className="relative py-16 lg:py-24" style={{ background: "var(--route-bg)" }}>
          <div className="site-container">
            <div className="mb-10 text-center">
              <p
                className="text-xs uppercase tracking-[0.28em]"
                style={{ color: "var(--route-gold)" }}
              >
                This route passes through
              </p>
              <h2
                className="mt-3 font-serif text-3xl leading-tight md:text-4xl"
                style={{ color: "var(--route-text)" }}
              >
                Cities along the way
              </h2>
              <p
                className="mx-auto mt-3 max-w-2xl text-sm leading-6"
                style={{ color: "rgba(26,42,58,0.45)" }}
              >
                Each city along this route opens its own cultural chapter.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCities.map(
                (city) =>
                  city && (
                    <Link
                      key={city.slug}
                      href={`/culture/${city.slug}`}
                      className="group flex flex-col overflow-hidden rounded-[1.5rem]"
                      style={{
                        background: "white",
                        boxShadow: "0 4px 24px rgba(26,42,58,0.06)",
                      }}
                    >
                      <div className="aspect-[3/2] overflow-hidden">
                        <img
                          src={city.gallery?.[0] || ""}
                          alt={city.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p
                          className="text-xs uppercase tracking-[0.16em]"
                          style={{ color: "var(--route-gold)" }}
                        >
                          {city.label}
                        </p>
                        <h3
                          className="mt-1 font-serif text-lg leading-tight"
                          style={{ color: "var(--route-text)" }}
                        >
                          {city.name}
                        </h3>
                        <p
                          className="mt-2 line-clamp-2 text-[13px] leading-relaxed"
                          style={{ color: "rgba(26,42,58,0.45)" }}
                        >
                          {city.tags?.join(" · ") || city.label}
                        </p>
                        <p
                          className="mt-auto pt-4 text-xs font-medium transition-colors"
                          style={{ color: "var(--route-gold)" }}
                        >
                          Explore {city.name} →
                        </p>
                      </div>
                    </Link>
                  ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-16 text-center lg:py-24" style={{ background: "#1A2A3A" }}>
        <div className="site-container">
          <p
            className="text-xs uppercase tracking-[0.28em]"
            style={{ color: "var(--route-gold)" }}
          >
            Turn this story route into guided travel
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-[1.2] text-white md:text-5xl">
            Want a guide who knows
            <br />
            every chapter by heart?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            One of our local interpreters can walk this route with you &mdash;
            telling the stories behind the stops in the language you understand
            best.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/interpreting"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-white transition-colors"
              style={{ background: "var(--route-gold)" }}
            >
              Book an interpreter
            </Link>
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/40"
            >
              Browse more routes
            </Link>
          </div>
        </div>
      </section>

      <MobileStickyActions
        actions={[
          { label: "Book This Route", href: "/interpreting#booking", variant: "primary" },
          { label: "Browse More Routes", href: "/routes", variant: "secondary" },
        ]}
      />
    </main>
  );
}
