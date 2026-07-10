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
      <section className="relative overflow-hidden pt-20 pb-12 sm:pb-16 lg:pt-32 lg:pb-24">
        <div className="site-container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="z-10 max-w-3xl lg:col-span-7">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("culture.atlas.eyebrow")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-[clamp(2.75rem,7vw,6rem)] leading-[0.92] tracking-[-0.04em] text-[var(--river-deep)]">
                  {t("culture.atlas.titlePrimary")} <br />
                  <span className="italic text-[var(--gold)]">
                    {t("culture.atlas.titleItalic")}
                  </span>
                </h1>
                <p className="handwritten mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:mt-12 sm:text-lg">
                  {t("culture.atlas.lede")}
                </p>
              </Reveal>
            </div>

            <div className="relative mx-auto mt-2 w-full max-w-[19rem] self-center sm:max-w-[22rem] lg:col-span-5 lg:mt-0 lg:max-w-none">
              <Reveal delay={200}>
                <div className="relative mx-auto aspect-[6/5] w-full overflow-hidden rounded-sm border-[0.5rem] border-white scrapbook-shadow sm:aspect-[4/5] sm:border-8 sm:rotate-2 lg:ml-auto">
                  <div
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat sm:bg-cover"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm -rotate-2 z-20" />
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white p-6 scrapbook-shadow -rotate-3 hidden md:block">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                    {t("culture.atlas.archiveLabel")}
                  </p>
                  <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] mt-1">
                    {t("culture.atlas.archiveCode")}
                  </p>
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
          <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-24">
            <AnimatePresence initial={false} mode="popLayout">
            {filteredCultures.map((city, index) => {
              const cardImage = city.image || placeholderFor("square");
              return (
                <motion.div
                  key={city.slug}
                  layout
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/culture/${city.slug}`} className="group block">
                    <article
                      className={`relative flex h-full flex-col transition-all duration-500 hover:-translate-y-3 ${
                        index % 3 === 0
                          ? "sm:-rotate-1"
                          : index % 3 === 1
                            ? "sm:rotate-1"
                            : "rotate-0"
                      }`}
                    >
                      <div className="relative aspect-[16/10] scrapbook-shadow overflow-hidden border-[0.55rem] border-white bg-white sm:aspect-[4/3] sm:border-[0.75rem]">
                        <div
                          className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-110 filter contrast-[1.05] brightness-[0.95] sepia-[0.1] sm:bg-cover"
                          style={{ backgroundImage: `url(${cardImage})` }}
                        />
                        <div className="absolute inset-0 bg-black/5" />

                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-mono uppercase tracking-tighter text-[var(--river-deep)] border border-black/5 shadow-sm">
                            REG-0{index + 20}
                          </div>
                        </div>

                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-10 bg-white/25 backdrop-blur-sm -rotate-3 z-20 border-x border-black/5" />
                      </div>

                      <div className="relative mt-6 px-1 sm:mt-8 sm:px-4">
                        <div className="absolute -top-12 -left-2 bg-[var(--gold)] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-lg -rotate-3 z-20">
                          {city.label}
                        </div>

                        <h2 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                          {city.name}
                        </h2>

                        <p className="mt-3 line-clamp-2 max-w-[34ch] text-sm leading-relaxed text-[var(--muted)] handwritten sm:max-w-[25ch]">
                          {city.narrative}
                        </p>

                        <div className="pt-6 flex items-center justify-between border-t border-[var(--line)]/50 mt-4">
                          <div className="flex gap-3">
                            {city.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] uppercase tracking-widest text-[var(--muted)]/40 font-bold"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[var(--cinnabar)] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">
                              {t("culture.atlas.openArchive")}
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
    </div>
  );
}
