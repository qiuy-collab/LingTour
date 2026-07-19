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
import { CultureIndexHero } from "@/components/culture/CultureIndexHero";
import { MediaFrame } from "@/components/ui/MediaFrame";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

interface CulturePageClientProps {
  initialCityCultures: CityCulture[];
}

export default function CulturePageClient({
  initialCityCultures,
}: CulturePageClientProps) {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [tag, setTag] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase(locale));
  const { data: cityCultures, loading, error, refetch } = useApiQuery(
    () => fetchCities(locale),
    [locale],
    { initialData: initialCityCultures },
  );

  useEffect(() => {
    setSearch("");
    setRegion("");
    setTag("");
  }, [locale]);

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
      .toLocaleLowerCase(locale);
    return (
      (!deferredSearch || searchable.includes(deferredSearch)) &&
      (!region || city.label === region) &&
      (!tag || city.tags.includes(tag))
    );
  });
  const heroImage = SEED_IMAGES.cultureHero ?? placeholderFor("portrait");
  const ctaImage = SEED_IMAGES.cultureCta ?? placeholderFor("hero");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <CultureIndexHero
        image={heroImage}
        eyebrow={t("culture.atlas.eyebrow")}
        title={t("culture.atlas.titlePrimary")}
        accent={t("culture.atlas.titleItalic")}
        lede={t("culture.atlas.lede")}
        cityCount={cultures.length}
        regionCount={regionOptions.length}
        archiveLabel={t("culture.atlas.archiveLabel")}
        archiveCode={t("culture.atlas.archiveCode")}
      />

      <section id="city-index" className="site-container py-12 sm:py-16 lg:py-24">
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredCultures.map((city, index) => {
                const cardImage = city.image || placeholderFor("square");
                const mosaicClass =
                  index % 5 === 0
                    ? "lg:col-span-7 lg:min-h-[34rem]"
                    : index % 5 === 1
                      ? "lg:col-span-5 lg:min-h-[34rem]"
                      : "lg:col-span-4 lg:min-h-[27rem]";
                return (
                  <motion.div
                    key={city.slug}
                    layout
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={`min-h-[26rem] ${mosaicClass}`}
                  >
                    <Reveal className="h-full">
                      <Link href={`/culture/${city.slug}`} className="group block h-full">
                        <article className="relative isolate h-full min-h-[26rem] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--night)] shadow-[0_18px_58px_rgba(17,25,35,0.1)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(17,25,35,0.18)]">
                          <MediaFrame
                            asset={city.primaryMedia}
                            fallbackSrc={cardImage}
                            alt={city.name}
                            mode="preview"
                            className="absolute inset-0"
                            mediaClassName="object-cover transition duration-1000 group-hover:scale-[1.045]"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,24,0.05)_15%,rgba(8,18,24,0.2)_46%,rgba(8,18,24,0.9)_100%)]" />

                          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                            <span className="rounded-full border border-white/42 bg-black/18 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                              {city.label}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/62">
                              REG-{String(index + 20).padStart(3, "0")}
                            </span>
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                              City file {String(index + 1).padStart(2, "0")}
                            </p>
                            <h2 className="mt-3 max-w-[12ch] font-[family:var(--font-display)] text-4xl leading-[0.92] tracking-[-0.04em] sm:text-5xl">
                              {city.name}
                            </h2>
                            <p className="mt-4 line-clamp-2 max-w-[42rem] text-sm leading-6 text-white/68 sm:text-base">
                              {city.narrative || city.summary}
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
                              <div className="flex flex-wrap gap-2">
                                {city.tags.slice(0, 3).map((cityTag) => (
                                  <span
                                    key={cityTag}
                                    className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/58"
                                  >
                                    #{cityTag}
                                  </span>
                                ))}
                              </div>
                              <span className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white transition group-hover:text-[var(--gold)]">
                                {t("culture.atlas.openArchive")}
                                <span aria-hidden className="transition group-hover:translate-x-1">→</span>
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
              className="absolute inset-0 bg-cover bg-center opacity-18 grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,52,61,0.95),rgba(20,52,61,0.72))]" />
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
    </div>
  );
}
