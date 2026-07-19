"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchCityBySlug, fetchCities, fetchRoutes } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { ErrorState, LoadingSpinner, useApiQuery } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { CityArchivalBook } from "@/components/culture/CityArchivalBook";
import { RelatedCitiesHub } from "@/components/culture/RelatedCitiesHub";
import { RelatedRouteHub } from "@/components/culture/RelatedRouteHub";
import type { CityCulture, CityCultureSection } from "@/data/culture";

export function CultureDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale, t } = useLocale();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<CityCulture>("city");
  const activeLocale = previewLocale ?? locale;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (previewLocale && previewLocale !== locale) {
      setLocale(previewLocale);
    }
  }, [locale, previewLocale, setLocale]);

  const { data: city, loading, error } = useApiQuery(
    () => fetchCityBySlug(slug, activeLocale),
    [slug, activeLocale],
  );
  const { data: cityCultures } = useApiQuery(
    () => fetchCities(activeLocale),
    [activeLocale],
  );
  const { data: storyRoutes } = useApiQuery(
    () => fetchRoutes(activeLocale),
    [activeLocale],
  );

  const activeCity = previewData ?? city;

  if (!hydrated) return <LoadingSpinner text="Opening the city file..." />;
  if (previewEnabled && !activeCity) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeCity) return <LoadingSpinner text="Opening the city file..." />;

  if (error && !activeCity) {
    return (
      <ErrorState
        title="City file unavailable"
        message="This city's archive can't be reached right now. Please try again shortly."
      />
    );
  }

  if (!activeCity) notFound();

  const allCities = cityCultures ?? [];
  const relatedRoutes = (storyRoutes ?? []).filter((route) =>
    activeCity.routeSlugs.includes(route.slug),
  );
  const linkedRoute = relatedRoutes[0] ?? null;
  const showRoutes = relatedRoutes.length > 0;
  const currentCityIndex = allCities.findIndex((item) => item.slug === activeCity.slug);
  const previousCity = currentCityIndex > 0 ? allCities[currentCityIndex - 1] : null;
  const nextCity =
    currentCityIndex >= 0 && currentCityIndex < allCities.length - 1
      ? allCities[currentCityIndex + 1]
      : null;

  const coverChapter: CityCultureSection = {
    title: activeCity.label || "Field Cover",
    body: activeCity.summary,
    image: activeCity.image,
    primaryMedia: activeCity.primaryMedia,
    images: activeCity.gallery,
    media: activeCity.galleryMedia,
    stat: `City Atlas / Registry ${activeCity.adcode}`,
    breathImage: activeCity.gallery?.[0],
    breathQuote: activeCity.narrative,
  };
  const foodChapter: CityCultureSection | null = activeCity.foodImages.length
    ? {
        title: activeCity.food || "Local Flavours",
        body: activeCity.foodDescription,
        image: activeCity.foodImages[0],
        images: activeCity.foodImages,
        stat: "Local Flavours",
        breathImage: activeCity.foodImages[1] ?? activeCity.foodImages[0],
      }
    : null;
  const bookSections = [
    coverChapter,
    ...activeCity.sections,
    ...(foodChapter ? [foodChapter] : []),
  ];

  const allCitiesLabel = activeLocale === "zh" ? "全部城市" : "All cities";
  const previousLabel = activeLocale === "zh" ? "上一份档案" : "Previous archive";
  const nextLabel = activeLocale === "zh" ? "下一份档案" : "Next archive";

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grain">
      <section id="section-masthead" className="relative isolate overflow-hidden bg-[var(--night)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(197,160,57,0.16),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(83,131,147,0.2),transparent_35%)]" />
        <div className="site-container relative py-10 sm:py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-14">
            <Reveal>
              <div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-white/48">
                  <span className="text-[var(--gold)]">City atlas</span>
                  <span aria-hidden>/</span>
                  <span>{activeCity.label}</span>
                </div>
                <h1 className="mt-6 max-w-[10ch] font-[family:var(--font-display)] text-[clamp(3.8rem,8vw,7.8rem)] leading-[0.84] tracking-[-0.065em]">
                  {activeCity.name}
                </h1>
                <p className="mt-7 max-w-[38rem] text-base leading-8 text-white/66 lg:text-lg">
                  {activeCity.summary}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {activeCity.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/62">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/community?compose=1&location=${encodeURIComponent(activeCity.name)}&channel=Culture%20Desk&title=${encodeURIComponent(activeCity.name)}&note=${encodeURIComponent(`City note from ${activeCity.name}: `)}`}
                    className="lt-action lt-action-gold"
                  >
                    Post city note <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="#section-chapters"
                    className="inline-flex min-h-12 items-center rounded-full border border-white/24 px-6 font-mono text-[9px] font-bold uppercase tracking-[0.18em] transition hover:bg-white hover:text-[var(--night)]"
                  >
                    Open chapters
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-white/14 bg-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:aspect-[16/11]">
                <MediaFrame
                  asset={activeCity.primaryMedia}
                  fallbackSrc={activeCity.image}
                  alt={`${activeCity.name} cultural landscape`}
                  mode={activeCity.primaryMedia?.type === "video" ? "interactive" : "image"}
                  eager
                  mediaClassName="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(7,16,22,0.75))]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 sm:p-7">
                  <div>
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/50">Archive coordinate</p>
                    <p className="mt-2 font-[family:var(--font-display)] text-2xl sm:text-3xl">{activeCity.label}</p>
                  </div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{activeCity.adcode}</p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/12 pt-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-stretch">
            <div className="grid grid-cols-2 gap-3 md:w-[18rem]">
              <div className="rounded-[var(--radius-md)] border border-white/12 bg-white/[0.05] p-4">
                <p className="font-[family:var(--font-display)] text-3xl">{activeCity.adcode}</p>
                <p className="mt-2 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-white/38">Registry</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-white/12 bg-white/[0.05] p-4">
                <p className="font-[family:var(--font-display)] text-3xl">{String(bookSections.length).padStart(2, "0")}</p>
                <p className="mt-2 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-white/38">Chapters</p>
              </div>
            </div>

            {linkedRoute ? (
              <Link href={`/routes/${linkedRoute.slug}`} className="group flex min-w-0 items-center justify-between gap-5 rounded-[var(--radius-md)] border border-white/12 bg-white/[0.05] p-5 transition hover:border-[var(--gold)]/45 hover:bg-white/[0.08]">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Linked route · {linkedRoute.duration}</p>
                  <p className="mt-2 truncate font-[family:var(--font-display)] text-2xl">{linkedRoute.title}</p>
                  <p className="mt-2 line-clamp-1 text-sm text-white/46">{linkedRoute.summary}</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/18 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[var(--night)]" aria-hidden>→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section id="section-chapters" className="scroll-mt-20">
        <CityArchivalBook
          cityName={activeCity.name}
          sections={bookSections}
          fallbackImage={activeCity.image}
          showIntro={false}
          immersive
        />
      </section>

      <section id="section-cities" className="border-t border-[var(--line)] bg-[var(--paper-deep)] py-14 sm:py-16 lg:py-24">
        <div className="site-container">
          <Reveal>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">Continue the atlas</p>
            <h2 className="mt-5 max-w-4xl font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.04em] text-[var(--river-deep)] md:text-6xl">
              {showRoutes ? t("culture.detail.routeLinks") : t("culture.detail.nearbyCities")}
            </h2>
          </Reveal>

          {showRoutes ? (
            <RelatedRouteHub
              routes={relatedRoutes}
              cityAdcode={activeCity.adcode}
              cityName={activeCity.name}
              cities={allCities}
            />
          ) : (
            <RelatedCitiesHub allCities={allCities} currentCity={activeCity} />
          )}
        </div>
      </section>

      <nav aria-label="City archive navigation" className="border-t border-white/10 bg-[var(--night)] py-10 text-white sm:py-12">
        <div className="site-container grid gap-3 sm:grid-cols-2">
          <Link
            href={previousCity ? `/culture/${previousCity.slug}` : "/culture"}
            className="group flex min-h-28 items-center gap-5 rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] p-5 transition hover:border-[var(--gold)]/40 hover:bg-white/[0.07]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/18 transition group-hover:-translate-x-1 group-hover:bg-white group-hover:text-[var(--night)]" aria-hidden>←</span>
            <div className="min-w-0">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/38">{previousLabel}</p>
              <p className="mt-2 truncate font-[family:var(--font-display)] text-2xl">{previousCity?.name ?? allCitiesLabel}</p>
            </div>
          </Link>
          <Link
            href={nextCity ? `/culture/${nextCity.slug}` : "/culture"}
            className="group flex min-h-28 items-center justify-between gap-5 rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] p-5 text-right transition hover:border-[var(--gold)]/40 hover:bg-white/[0.07]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/38">{nextLabel}</p>
              <p className="mt-2 truncate font-[family:var(--font-display)] text-2xl">{nextCity?.name ?? allCitiesLabel}</p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/18 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[var(--night)]" aria-hidden>→</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
