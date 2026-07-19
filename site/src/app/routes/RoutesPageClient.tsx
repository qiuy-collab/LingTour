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
import { RouteIndexHero } from "@/components/routes/RouteIndexHero";

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
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const [culture, setCulture] = useState("");
  const [duration, setDuration] = useState("");
  const [audience, setAudience] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase(locale));
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
    { initialData: initialRoutes },
  );

  useEffect(() => {
    setSearch("");
    setCulture("");
    setDuration("");
    setAudience("");
  }, [locale]);

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
      .toLocaleLowerCase(locale);
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
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <RouteIndexHero
        image={heroImage}
        eyebrow={t("routes.atlas.eyebrow")}
        title={t("routes.atlas.titlePrimary")}
        accent={t("routes.atlas.titleItalic")}
        lede={t("routes.atlas.lede")}
        routeCount={storyRoutes.length}
        regionCount={uniqueValues(storyRoutes.map((route) => route.city)).length}
      />

      <section id="route-index" className="site-container py-12 sm:py-16 lg:py-24">
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
        ) : filteredRoutes.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <h3 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("routes.filter.emptyTitle")}
            </h3>
            <p className="handwritten mt-4 text-base text-[var(--muted)]">
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
              className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)] underline underline-offset-4"
            >
              {t("routes.filter.clear")}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:gap-8">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredRoutes.map((route, i) => {
                const cardImage = route.image || placeholderFor("hero");
                const reverse = i % 2 === 1;
                return (
                  <motion.div
                    key={route.slug}
                    layout
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Reveal>
                      <Link href={`/routes/${route.slug}`} className="group block">
                        <article className="grid min-h-[25rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_18px_60px_rgba(17,25,35,0.07)] transition duration-500 hover:-translate-y-1 hover:border-[var(--river)]/35 hover:shadow-[0_28px_90px_rgba(17,25,35,0.13)] md:grid-cols-12">
                          <div
                            className={`relative min-h-[17rem] overflow-hidden md:col-span-7 md:min-h-full ${
                              reverse ? "md:order-2" : ""
                            }`}
                          >
                            <img
                              src={cardImage}
                              alt=""
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.045]"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(8,18,24,0.52))]" />
                            <span className="absolute left-5 top-5 rounded-full border border-white/45 bg-black/28 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                              Route {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 text-white/82">
                              {route.itinerary.slice(0, 5).map((stop, index) => (
                                <span key={`${stop.stop}-${index}`} className="contents">
                                  {index > 0 ? <span className="h-px flex-1 bg-white/36" /> : null}
                                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/55 bg-black/25 font-mono text-[9px] backdrop-blur-sm">
                                    {index + 1}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div
                            className={`flex min-w-0 flex-col justify-between p-6 sm:p-8 md:col-span-5 lg:p-10 ${
                              reverse ? "md:order-1" : ""
                            }`}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                                <span>{route.culture}</span>
                                <span className="text-[var(--line)]">/</span>
                                <span className="text-[var(--muted)]">{route.duration}</span>
                              </div>
                              <h2 className="mt-5 font-[family:var(--font-display)] text-3xl leading-[0.98] tracking-[-0.035em] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl lg:text-5xl">
                                {route.title}
                              </h2>
                              <p className="mt-5 line-clamp-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                                {route.summary}
                              </p>
                            </div>

                            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                              <div>
                                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                                  {t("routes.atlas.waypoints")}
                                </p>
                                <p className="mt-1 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                                  {route.itinerary.length}
                                </p>
                              </div>
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--river-deep)] text-white transition duration-300 group-hover:translate-x-1 group-hover:bg-[var(--cinnabar)]">
                                <span aria-hidden>→</span>
                                <span className="sr-only">{t("routes.atlas.dispatchInfo")}</span>
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </Reveal>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section className="pb-16 sm:pb-20 lg:pb-28">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--river-deep)] px-6 py-16 text-center text-white shadow-[0_28px_90px_rgba(17,25,35,0.18)] sm:px-8 sm:py-20 lg:px-20 lg:py-24">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-16 grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,52,61,0.96),rgba(20,52,61,0.74))]" />
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
