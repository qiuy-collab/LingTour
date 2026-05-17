"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";

export default function RoutesPage() {
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Drawing the routes..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const storyRoutes = data;

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--sandstone)] opacity-20 -skew-x-12 translate-x-1/4" />

        <div className="site-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="inline-block px-4 py-1 border border-[var(--cinnabar)] text-[var(--cinnabar)] text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                  Story Routes / Selection
                </div>
                <h1 className="font-[family:var(--font-display)] text-6xl md:text-8xl lg:text-[10rem] leading-[0.8] tracking-[-0.05em] text-[var(--river-deep)] mix-blend-multiply">
                  Follow a <br />
                  <span className="text-[var(--gold)] italic">Story.</span>
                </h1>
                <div className="mt-16 flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-px h-24 bg-[var(--line)] hidden md:block" />
                  <p className="max-w-xl text-xl leading-relaxed text-[var(--muted)]">
                    These routes are built like narrative arcs: a first impression, a turning point, a table, a street, and a place that stays with you after the day ends.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-4 relative mt-12 lg:mt-0">
              <Reveal delay={300}>
                <div className="relative aspect-[3/4] scrapbook-shadow -rotate-3 group">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=82)",
                    }}
                  />
                  <div className="absolute inset-0 border-[1rem] border-white shadow-inner" />

                  {/* Handwritten Annotation */}
                  <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-[url('/assets/images/stamp-circle.svg')] bg-contain bg-no-repeat opacity-20 animate-spin-slow" />
                  <div className="absolute top-1/2 -right-12 handwritten text-2xl text-[var(--gold)] -rotate-90 origin-bottom-right">
                    Archive: Route 01-12
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
          {storyRoutes.map((route, i) => (
            <Reveal key={route.slug} delay={i * 100}>
              <Link href={`/routes/${route.slug}`} className="group block">
                <article className="relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(17,25,35,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,25,35,0.1)]">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${route.image})` }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,25,35,0.7),transparent_50%)]" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                          {route.culture}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          {route.duration}
                        </span>
                      </div>
                      <h2 className="mt-3 font-[family:var(--font-display)] text-3xl leading-tight text-white sm:text-4xl">
                        {route.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                      {route.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {route.itinerary.slice(0, 4).map((item, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-[11px] text-[var(--muted)]"
                        >
                          {item.stop}
                        </span>
                      ))}
                      {route.itinerary.length > 4 && (
                        <span className="px-2 py-1 text-[11px] italic text-[var(--muted)]">
                          +{route.itinerary.length - 4}
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)] transition-colors group-hover:text-[var(--cinnabar-deep)]">
                      <span>Explore route</span>
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  Need a local voice?
                </p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                  Walk the route with someone who knows where the quiet details are hiding.
                </h2>
                <div className="mt-8">
                  <Link
                    href="/interpreting"
                    className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
                  >
                    Plan interpreting
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
