"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { StoryRoute } from "@/data/routes";
import { ArchiveFilterBar } from "@/components/ui/ArchiveFilterBar";
import { PastoralPageMotion } from "@/components/ui/PastoralPageMotion";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

interface RoutesPageClientProps {
  initialRoutes: StoryRoute[];
}

export default function RoutesPageClient({
  initialRoutes,
}: RoutesPageClientProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [culture, setCulture] = useState("");
  const [duration, setDuration] = useState("");
  const [audience, setAudience] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(),
    [],
    { initialData: initialRoutes, revalidateOnMount: false },
  );

  useEffect(() => {
    setSearch("");
    setCulture("");
    setDuration("");
    setAudience("");
  }, []);

  if (loading && initialRoutes.length === 0) {
    return <LoadingSpinner text="Drawing the routes..." />;
  }

  if (error && initialRoutes.length === 0) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const storyRoutes = data ?? initialRoutes;
  const cultureOptions = uniqueValues(storyRoutes.map((route) => route.culture));
  const durationOptions = uniqueValues(storyRoutes.map((route) => route.duration));
  const audienceOptions = uniqueValues(storyRoutes.map((route) => route.audience));
  const filteredRoutes = storyRoutes.filter((route) => {
    const searchable = [route.title, route.city, route.culture, route.duration, route.audience, route.summary]
      .join(" ")
      .toLowerCase();
    return (
      (!deferredSearch || searchable.includes(deferredSearch)) &&
      (!culture || route.culture === culture) &&
      (!duration || route.duration === duration) &&
      (!audience || route.audience === audience)
    );
  });
  const heroImage = SEED_IMAGES.routesHero ?? placeholderFor("portrait");
  const ctaImage = SEED_IMAGES.routesCta ?? placeholderFor("hero");

  return (
    <PastoralPageMotion
      className="min-h-screen bg-[var(--paper-deep)] bg-grain"
      motionKey={filteredRoutes.map((route) => route.slug).join("|")}
    >
      <section className="relative overflow-hidden border-b border-[var(--line)] py-10 sm:py-12 lg:py-16">
        <div className="site-container relative">
          <div className="grid items-center gap-8 sm:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)] sm:gap-10 lg:grid-cols-[minmax(18rem,0.68fr)_minmax(0,1.32fr)] lg:gap-14">
            <Reveal className="order-2 sm:order-1">
              <div className="relative aspect-[4/3] overflow-hidden border-[0.5rem] border-white bg-white scrapbook-shadow sm:aspect-[3/4] sm:border-[0.65rem] lg:border-[0.75rem]">
                <div
                  data-pastoral-hero-media
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 motion-reduce:transform-none"
                  style={{ backgroundImage: `url(${heroImage})` }}
                  role="img"
                  aria-label="Landscape from a Guangdong route"
                />
              </div>
            </Reveal>

            <Reveal className="order-1 min-w-0 sm:order-2">
              <h1 data-pastoral-title className="max-w-[13ch] text-balance font-[family:var(--font-display)] text-[clamp(2.65rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.04em] text-[var(--river-deep)] lg:max-w-none lg:whitespace-nowrap">
                Routes
              </h1>
              <p data-pastoral-subtitle className="mt-5 max-w-[50ch] text-pretty text-base leading-7 text-[var(--muted)] sm:mt-6 lg:text-lg">
                {t("routes.atlas.lede")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="site-container py-10 sm:py-12 lg:py-20">
        {storyRoutes.length > 0 ? (
          <ArchiveFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchLabel={t("routes.filter.searchLabel")}
            searchPlaceholder={t("routes.filter.searchPlaceholder")}
            countLabel={t("routes.filter.count")
              .replace("{visible}", String(filteredRoutes.length))
              .replace("{total}", String(storyRoutes.length))}
            filterLabel={t("routes.filter.open")}
            allLabel={t("routes.filter.all")}
            clearLabel={t("routes.filter.clear")}
            groups={[
              {
                label: t("routes.filter.culture"),
                value: culture,
                options: cultureOptions.map((value) => ({ value, label: value })),
                onChange: setCulture,
              },
              {
                label: t("routes.filter.duration"),
                value: duration,
                options: durationOptions.map((value) => ({ value, label: value })),
                onChange: setDuration,
              },
              {
                label: t("routes.filter.audience"),
                value: audience,
                options: audienceOptions.map((value) => ({ value, label: value })),
                onChange: setAudience,
              },
            ]}
            onClear={() => {
              setSearch("");
              setCulture("");
              setDuration("");
              setAudience("");
            }}
          />
        ) : null}
        {storyRoutes.length === 0 ? (
          <div className="mx-auto max-w-2xl border border-[var(--line)] bg-white/70 p-8 sm:p-10">
            <h2 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("routes.atlas.empty.title")}
            </h2>
            <p className="mt-4 max-w-[55ch] text-base leading-7 text-[var(--muted)]">
              {t("routes.atlas.empty.body")}
            </p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <h2 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("routes.filter.emptyTitle")}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              {t("routes.filter.emptyBody")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCulture("");
                setDuration("");
                setAudience("");
              }}
              className="mt-7 min-h-11 text-sm font-semibold text-[var(--river-deep)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--river-deep)]"
            >
              {t("routes.filter.clear")}
            </button>
          </div>
        ) : (
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-14 md:overflow-visible md:px-0 lg:gap-x-20 lg:gap-y-20">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredRoutes.map((route, index) => {
                const cardImage = route.image || placeholderFor("hero");
                return (
                  <motion.div
                    key={route.slug}
                    className="w-[82vw] max-w-[25rem] shrink-0 snap-start md:w-auto md:max-w-none md:shrink md:snap-none"
                    layout
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={`/routes/${route.slug}`} className="group block" data-pastoral-card>
                      <article className={`flex h-full flex-col transition-transform duration-500 motion-reduce:transform-none hover:-translate-y-2 ${index % 2 === 0 ? "sm:rotate-[0.7deg]" : "sm:-rotate-[0.7deg]"}`}>
                        <div className="relative aspect-[16/10] overflow-hidden border-[0.55rem] border-white bg-white scrapbook-shadow sm:border-[0.85rem]">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 motion-reduce:transform-none group-hover:scale-105"
                            style={{ backgroundImage: `url(${cardImage})` }}
                            role="img"
                            aria-label={`${route.title} route`}
                          />
                        </div>

                        <div className="flex flex-1 flex-col px-1 pb-1 pt-6 sm:px-4 sm:pt-8">
                          <h2 className="text-balance font-[family:var(--font-display)] text-3xl leading-[1.03] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                            {route.title}
                          </h2>
                          <p className="mt-4 max-w-[37ch] text-pretty text-sm leading-7 text-[var(--muted)] sm:text-base">
                            {route.summary}
                          </p>
                          <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--river-deep)]">
                            <div>
                              <dt className="sr-only">City</dt>
                              <dd>{route.city}</dd>
                            </div>
                            <div>
                              <dt className="sr-only">Duration</dt>
                              <dd>{route.duration}</dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="sr-only">Culture</dt>
                              <dd>{route.culture}</dd>
                            </div>
                          </dl>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section className="pb-20 lg:pb-32">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-6 py-16 text-white scrapbook-shadow sm:px-8 sm:py-20 lg:px-20 lg:py-28">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <Reveal>
                <h2 className="font-[family:var(--font-display)] text-3xl leading-tight sm:text-4xl md:text-6xl">
                  {t("routes.cta.localVoice.title")}
                </h2>
                <div className="mt-10">
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
    </PastoralPageMotion>
  );
}
