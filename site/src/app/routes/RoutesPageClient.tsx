"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { StoryRoute } from "@/data/routes";

interface RoutesPageClientProps {
  initialRoutes: StoryRoute[];
}

export default function RoutesPageClient({
  initialRoutes,
}: RoutesPageClientProps) {
  const { t, locale } = useLocale();
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
    { initialData: initialRoutes },
  );

  if (loading && initialRoutes.length === 0) {
    return <LoadingSpinner text="Drawing the routes..." />;
  }

  if (error && initialRoutes.length === 0) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const storyRoutes = data ?? initialRoutes;
  const heroImage = SEED_IMAGES.routesHero ?? placeholderFor("portrait");
  const ctaImage = SEED_IMAGES.routesCta ?? placeholderFor("hero");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--sandstone)] opacity-20 -skew-x-12 translate-x-1/4" />

        <div className="site-container relative">
          <div className="grid grid-cols-12 gap-5 sm:gap-10 lg:items-start lg:gap-16">
            <div className="col-span-7 sm:col-span-7 lg:col-span-8">
              <Reveal>
                <div className="inline-block px-4 py-1 border border-[var(--cinnabar)] text-[var(--cinnabar)] text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                  {t("routes.atlas.eyebrow")}
                </div>
                <h1 className="font-[family:var(--font-display)] text-[2.6rem] leading-[0.9] tracking-[-0.05em] text-[var(--river-deep)] mix-blend-multiply sm:text-6xl md:text-8xl lg:text-[10rem]">
                  {t("routes.atlas.titlePrimary")} <br />
                  <span className="text-[var(--gold)] italic">
                    {t("routes.atlas.titleItalic")}
                  </span>
                </h1>
                <div className="mt-8 flex flex-col items-start gap-4 md:mt-16 md:flex-row md:gap-8">
                  <div className="hidden h-24 w-px bg-[var(--line)] md:block" />
                  <p className="max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-xl">
                    {t("routes.atlas.lede")}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="relative col-span-5 mt-1 self-center sm:col-span-5 sm:mt-4 lg:col-span-4 lg:mt-0">
              <Reveal delay={300}>
                <div className="group relative ml-auto aspect-[3/4] w-full scrapbook-shadow sm:max-w-[22rem] sm:aspect-[3/4] sm:-rotate-3">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute inset-0 border-[1rem] border-white shadow-inner" />

                  <div className="absolute -bottom-4 right-2 hidden h-32 w-32 place-items-center rounded-full border-2 border-dashed border-[var(--cinnabar)]/30 bg-[radial-gradient(circle,rgba(182,66,53,0.12)_0%,rgba(182,66,53,0.03)_45%,transparent_70%)] text-center text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]/45 animate-spin-slow sm:grid sm:h-40 sm:w-40 sm:text-[10px] sm:tracking-[0.35em] lg:-bottom-8 lg:-right-4">
                    <span className="leading-relaxed">
                      Field
                      <br />
                      Dispatch
                    </span>
                  </div>
                  <div className="handwritten absolute bottom-3 left-4 text-lg text-[var(--gold)] sm:bottom-auto sm:left-auto sm:top-1/2 sm:-right-12 sm:origin-bottom-right sm:-rotate-90 sm:text-2xl sm:whitespace-nowrap">
                    {t("routes.atlas.archiveBadge")}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 sm:py-12 lg:py-20">
        {storyRoutes.length === 0 ? (
          <div className="scrapbook-shadow mx-auto max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              {t("routes.atlas.eyebrow")}
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("routes.atlas.empty.title")}
            </h3>
            <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {t("routes.atlas.empty.body")}
            </p>
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:gap-x-20 lg:gap-y-20">
            {storyRoutes.map((route, i) => {
              const cardImage = route.image || placeholderFor("hero");
              return (
                <Reveal key={route.slug} delay={i * 100}>
                  <Link href={`/routes/${route.slug}`} className="group block">
                    <article
                      className={`relative grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-4 transition-all duration-500 sm:block hover:-translate-y-3 ${
                        i % 2 === 0 ? "sm:rotate-1" : "sm:-rotate-1"
                      }`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden border-[0.55rem] border-white bg-white scrapbook-shadow sm:aspect-[16/10] sm:border-[0.85rem]">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 filter contrast-[1.05] brightness-[0.9] saturate-[0.85]"
                          style={{ backgroundImage: `url(${cardImage})` }}
                        />
                        <div className="absolute inset-0 bg-black/5" />

                        <div className="absolute top-4 right-4 z-10 flex flex-col items-center">
                          <div className="bg-[var(--cinnabar)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg -rotate-6">
                            {route.duration}
                          </div>
                          <div className="w-px h-6 bg-white/40 mt-1" />
                        </div>

                      </div>

                      <div className="relative mt-0 space-y-3 px-0 pt-1 sm:mt-8 sm:space-y-4 sm:px-4 sm:pt-0">
                        <div className="handwritten pointer-events-none absolute -top-12 left-0 hidden select-none text-3xl text-[var(--gold)]/40 sm:block sm:-left-2 sm:-top-16 sm:-rotate-12 sm:text-4xl">
                          #{i + 1}
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                            {route.culture}
                          </p>
                          <div className="h-px flex-1 bg-[var(--line)]/50" />
                        </div>

                        <h2 className="font-[family:var(--font-display)] text-[2.45rem] leading-[1] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                          {route.title}
                        </h2>

                        <p className="handwritten line-clamp-3 max-w-none text-[13px] leading-relaxed text-[var(--muted)] sm:max-w-[32ch] sm:text-base">
                          {route.summary}
                        </p>

                        <div className="flex items-center justify-between border-t border-[var(--line)]/30 pt-4">
                          <div className="flex items-center gap-2">
                            <div className="handwritten text-xs text-[var(--muted)]">
                              {t("routes.atlas.waypoints")}
                            </div>
                            <div className="flex -space-x-2">
                              {route.itinerary.slice(0, 3).map((_, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full border-2 border-white bg-[var(--paper-deep)] flex items-center justify-center text-[10px] font-bold text-[var(--river-deep)] shadow-sm"
                                >
                                  {idx + 1}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[var(--cinnabar)] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">
                              {t("routes.atlas.dispatchInfo")}
                            </span>
                            <svg
                              className="h-3 w-3 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                d="M5 12h14M12 5l7 7-7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="pb-20 lg:pb-32">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-6 py-16 text-center text-white scrapbook-shadow sm:px-8 sm:py-20 lg:px-20 lg:py-28">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  {t("routes.cta.localVoice.eyebrow")}
                </p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-3xl leading-tight sm:text-4xl md:text-6xl">
                  {t("routes.cta.localVoice.title")}
                </h2>
                <div className="mt-12">
                  <Link
                    href="/interpreting"
                    className="btn-gold inline-flex w-full justify-center px-8 py-4 text-xs sm:w-auto sm:px-12 sm:py-5"
                  >
                    {t("routes.cta.localVoice.button")}
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
