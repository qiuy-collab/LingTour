"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/locale-context";
import { fetchCities } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { CityCulture } from "@/data/culture";
import { ArchiveFilterBar } from "@/components/ui/ArchiveFilterBar";
import { PastoralPageMotion } from "@/components/ui/PastoralPageMotion";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

function indexLayout(index: number) {
  if (index === 0) {
    return "md:col-span-2 lg:col-span-7 lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(13rem,0.82fr)] lg:items-end lg:gap-8";
  }
  if (index % 4 === 1) return "lg:col-span-5 lg:mt-20";
  if (index % 4 === 2) return "lg:col-span-4 lg:-mt-5";
  return "lg:col-span-8 lg:mt-14 lg:grid lg:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-8";
}

function imageLayout(index: number) {
  if (index === 0) return "aspect-[16/10] lg:aspect-[5/4]";
  if (index % 4 === 1) return "aspect-[4/5]";
  if (index % 4 === 2) return "aspect-square";
  return "aspect-[16/10] lg:aspect-[5/4]";
}

interface CulturePageClientProps {
  initialCityCultures: CityCulture[];
}

export default function CulturePageClient({
  initialCityCultures,
}: CulturePageClientProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [tag, setTag] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const { data: cityCultures, loading, error, refetch } = useApiQuery(
    () => fetchCities(),
    [],
    { initialData: initialCityCultures, revalidateOnMount: false },
  );

  useEffect(() => {
    setSearch("");
    setRegion("");
    setTag("");
  }, []);

  if (loading && initialCityCultures.length === 0) {
    return <LoadingSpinner text="Opening the city atlas..." />;
  }

  if (error && initialCityCultures.length === 0) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const cultures = cityCultures ?? initialCityCultures;
  const regionOptions = uniqueValues(cultures.map((city) => city.label));
  const tagOptions = uniqueValues(cultures.flatMap((city) => city.tags));
  const filteredCultures = cultures.filter((city) => {
    const searchable = [city.name, city.label, city.summary, city.narrative, ...city.tags]
      .join(" ")
      .toLowerCase();
    return (
      (!deferredSearch || searchable.includes(deferredSearch)) &&
      (!region || city.label === region) &&
      (!tag || city.tags.includes(tag))
    );
  });
  const heroImage = SEED_IMAGES.cultureHero ?? placeholderFor("portrait");
  const ctaImage = SEED_IMAGES.cultureCta ?? placeholderFor("hero");

  return (
    <>
      <PastoralPageMotion
        className="min-h-screen bg-[var(--paper-deep)] bg-grain"
        motionKey={filteredCultures.map((city) => city.slug).join("|")}
      >
      <section className="relative overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-24 lg:pt-32">
        <div className="site-container">
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.75fr)] sm:gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="z-10 min-w-0 max-w-3xl lg:col-span-7">
              <Reveal>
                <p data-pastoral-kicker className="mb-6 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--cinnabar)] sm:mb-8">
                  {t("culture.atlas.eyebrow")}
                </p>
                <h1 className="font-[family:var(--font-display)] text-[clamp(2.25rem,8.5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-[var(--river-deep)] lg:text-[clamp(2.75rem,7vw,6rem)]">
                  <span className="block overflow-hidden pb-1"><span data-pastoral-title className="block">{t("culture.atlas.titlePrimary")}</span></span>
                  <span className="block overflow-hidden pb-3"><span data-pastoral-title className="block italic text-[var(--gold)]">{t("culture.atlas.titleItalic")}</span></span>
                </h1>
                <p data-pastoral-subtitle className="handwritten mt-5 max-w-xl text-[13px] leading-6 text-[var(--muted)] sm:mt-8 sm:text-base sm:leading-relaxed lg:mt-12 lg:text-lg">
                  {t("culture.atlas.lede")}
                </p>
              </Reveal>
            </div>

            <div className="relative w-full min-w-0 self-end lg:col-span-5 lg:max-w-none lg:self-center">
              <Reveal delay={200}>
                <div className="relative ml-auto aspect-[4/3] w-full overflow-hidden border-[0.35rem] border-white scrapbook-shadow rotate-2 sm:aspect-[3/4] sm:border-8 lg:aspect-[4/5]">
                  <div
                    data-pastoral-hero-media
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-20">
        {cultures.length > 0 ? (
          <ArchiveFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchLabel={t("culture.filter.searchLabel")}
            searchPlaceholder={t("culture.filter.searchPlaceholder")}
            countLabel={t("culture.filter.count")
              .replace("{visible}", String(filteredCultures.length))
              .replace("{total}", String(cultures.length))}
            filterLabel={t("culture.filter.open")}
            allLabel={t("culture.filter.all")}
            clearLabel={t("culture.filter.clear")}
            groups={[
              {
                label: t("culture.filter.region"),
                value: region,
                options: regionOptions.map((value) => ({ value, label: value })),
                onChange: setRegion,
              },
              {
                label: t("culture.filter.tags"),
                value: tag,
                options: tagOptions.map((value) => ({ value, label: value })),
                onChange: setTag,
              },
            ]}
            onClear={() => {
              setSearch("");
              setRegion("");
              setTag("");
            }}
          />
        ) : null}
        {cultures.length === 0 ? (
          <div className="scrapbook-shadow mx-auto max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              {t("culture.atlas.eyebrow")}
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("culture.atlas.empty.title")}
            </h3>
            <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {t("culture.atlas.empty.body")}
            </p>
          </div>
        ) : filteredCultures.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <h3 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("culture.filter.emptyTitle")}
            </h3>
            <p className="handwritten mt-4 text-base text-[var(--muted)]">
              {t("culture.filter.emptyBody")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRegion("");
                setTag("");
              }}
              className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)] underline underline-offset-4"
            >
              {t("culture.filter.clear")}
            </button>
          </div>
        ) : (
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-16 md:overflow-visible md:px-0 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-20">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredCultures.map((city, index) => {
                const cardImage = city.image || placeholderFor("square");
                return (
                  <motion.div
                    key={city.slug}
                    className={`w-[82vw] max-w-[24rem] shrink-0 snap-start md:w-auto md:max-w-none md:shrink md:snap-none ${indexLayout(index)}`}
                    layout
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={`/culture/${city.slug}`} className="group block" data-pastoral-card>
                      <article className="h-full min-w-0">
                        <div className={`relative overflow-hidden border-[0.55rem] border-white bg-white scrapbook-shadow sm:border-[0.75rem] ${imageLayout(index)}`}>
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                            style={{ backgroundImage: `url(${cardImage})` }}
                          />
                          <div className="absolute inset-0 bg-black/[0.07]" />
                        </div>

                        <div className="mt-5 min-w-0 border-t border-[var(--line)] pt-4 sm:mt-6 sm:pt-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                            {city.label}
                          </p>
                          <h2 className="mt-2 font-[family:var(--font-display)] text-3xl leading-[0.98] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                            {city.name}
                          </h2>
                          <p className="handwritten mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                            {city.narrative}
                          </p>
                          <div className="mt-5 flex items-end justify-between gap-4">
                            {city.tags.length > 0 ? (
                              <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
                                {city.tags.slice(0, 2).join(" / ")}
                              </p>
                            ) : <span />}
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/45 underline-offset-4">
                              Read city
                            </span>
                          </div>
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
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-6 py-16 text-center text-white scrapbook-shadow sm:px-8 sm:py-20 lg:px-20 lg:py-28">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  {t("culture.cta.eyebrow")}
                </p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-3xl leading-tight sm:text-4xl md:text-6xl">
                  {t("culture.cta.title")}
                </h2>
                <div className="mt-12">
                  <Link
                    href="/routes"
                    className="btn-gold inline-flex w-full justify-center px-8 py-4 text-xs sm:w-auto sm:px-12 sm:py-5"
                  >
                    {t("culture.cta.button")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
      </PastoralPageMotion>
    </>
  );
}
