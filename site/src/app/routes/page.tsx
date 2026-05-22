"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";

export default function RoutesPage() {
  const { t, locale } = useLocale();
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Drawing the routes..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const storyRoutes = data;
  const heroImage = SEED_IMAGES.routesHero ?? placeholderFor("portrait");
  const ctaImage = SEED_IMAGES.routesCta ?? placeholderFor("hero");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--sandstone)] opacity-20 -skew-x-12 translate-x-1/4" />

        <div className="site-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="inline-block px-4 py-1 border border-[var(--cinnabar)] text-[var(--cinnabar)] text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                  {t("routes.atlas.eyebrow")}
                </div>
                <h1 className="font-[family:var(--font-display)] text-6xl md:text-8xl lg:text-[10rem] leading-[0.8] tracking-[-0.05em] text-[var(--river-deep)] mix-blend-multiply">
                  {t("routes.atlas.titlePrimary")} <br />
                  <span className="text-[var(--gold)] italic">
                    {t("routes.atlas.titleItalic")}
                  </span>
                </h1>
                <div className="mt-16 flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-px h-24 bg-[var(--line)] hidden md:block" />
                  <p className="max-w-xl text-xl leading-relaxed text-[var(--muted)]">
                    {t("routes.atlas.lede")}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-4 relative mt-12 lg:mt-0">
              <Reveal delay={300}>
                <div className="relative aspect-[3/4] scrapbook-shadow -rotate-3 group">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute inset-0 border-[1rem] border-white shadow-inner" />

                  <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-[url('/assets/images/stamp-circle.svg')] bg-contain bg-no-repeat opacity-20 animate-spin-slow" />
                  <div className="absolute top-1/2 -right-12 handwritten text-2xl text-[var(--gold)] -rotate-90 origin-bottom-right whitespace-nowrap">
                    {t("routes.atlas.archiveBadge")}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
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
          <div className="grid gap-x-12 gap-y-24 sm:grid-cols-2 lg:gap-x-20">
            {storyRoutes.map((route, i) => {
              const cardImage = route.image || placeholderFor("hero");
              return (
                <Reveal key={route.slug} delay={i * 100}>
                  <Link href={`/routes/${route.slug}`} className="group block">
                    <article
                      className={`relative transition-all duration-500 hover:-translate-y-3 ${
                        i % 2 === 0 ? "rotate-1" : "-rotate-1"
                      }`}
                    >
                      <div className="relative aspect-[16/10] scrapbook-shadow border-[0.85rem] border-white overflow-hidden bg-white">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 filter contrast-[1.05] brightness-[0.9] saturate-[0.85]"
                          style={{ backgroundImage: `url(${cardImage})` }}
                        />
                        <div className="absolute inset-0 bg-black/5" />

                        <div className="absolute top-4 right-4 z-10 flex flex-col items-center">
                          <div className="bg-[var(--cinnabar)] px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white shadow-lg -rotate-6">
                            {route.duration}
                          </div>
                          <div className="w-px h-6 bg-white/40 mt-1" />
                        </div>

                        <div className="absolute -top-5 left-1/4 w-24 h-10 bg-white/20 backdrop-blur-sm rotate-6 z-20 border-x border-black/5" />
                      </div>

                      <div className="mt-10 space-y-5 px-4 relative">
                        <div className="absolute -top-16 -left-2 handwritten text-4xl text-[var(--gold)]/40 -rotate-12 select-none pointer-events-none">
                          #{i + 1}
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                            {route.culture}
                          </p>
                          <div className="h-px flex-1 bg-[var(--line)]/50" />
                        </div>

                        <h2 className="font-[family:var(--font-display)] text-4xl leading-[1.05] text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                          {route.title}
                        </h2>

                        <p className="line-clamp-2 text-base leading-relaxed text-[var(--muted)] handwritten max-w-[32ch]">
                          {route.summary}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]/30">
                          <div className="flex items-center gap-2">
                            <div className="handwritten text-xs text-[var(--muted)]">
                              {t("routes.atlas.waypoints")}
                            </div>
                            <div className="flex -space-x-2">
                              {route.itinerary.slice(0, 3).map((_, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full border-2 border-white bg-[var(--paper-deep)] flex items-center justify-center text-[8px] font-bold text-[var(--river-deep)] shadow-sm"
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

      <section className="pb-24 lg:pb-32">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-8 py-20 text-center text-white lg:px-20 lg:py-28 scrapbook-shadow">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  {t("routes.cta.localVoice.eyebrow")}
                </p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight md:text-6xl">
                  {t("routes.cta.localVoice.title")}
                </h2>
                <div className="mt-12">
                  <Link
                    href="/interpreting"
                    className="btn-gold inline-flex px-12 py-5 text-xs"
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
