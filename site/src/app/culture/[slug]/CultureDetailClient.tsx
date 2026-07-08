"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchCityBySlug, fetchCities, fetchRoutes } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { ErrorState, LoadingSpinner, useApiQuery } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { CityArchivalBook } from "@/components/culture/CityArchivalBook";
import { RelatedCitiesHub } from "@/components/culture/RelatedCitiesHub";
import { RelatedRouteHub } from "@/components/culture/RelatedRouteHub";
import type { CityCulture, CityCultureSection } from "@/data/culture";

export function CultureDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale } = useLocale();
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

  if (!hydrated) {
    return <LoadingSpinner text="Opening the city file..." />;
  }

  if (previewEnabled && !activeCity) {
    return <LoadingSpinner text="Loading preview..." />;
  }

  if (loading && !activeCity) {
    return <LoadingSpinner text="Opening the city file..." />;
  }

  if (error && !activeCity) {
    return (
      <ErrorState
        title="City file unavailable"
        message="This city's archive can't be reached right now. Please try again shortly."
      />
    );
  }

  // The fetch finished successfully but returned no city for this slug, so
  // render the framework's not-found page instead of silently bouncing.
  if (!activeCity) {
    notFound();
  }

  const relatedRoutes = (storyRoutes ?? []).filter((route) =>
    activeCity.routeSlugs.includes(route.slug),
  );
  const showRoutes = relatedRoutes.length > 0;
  const linkedRoute = relatedRoutes[0] ?? null;

  const coverChapter: CityCultureSection = {
    title: activeCity.label || "Field Cover",
    body: activeCity.summary,
    image: activeCity.image,
    images: activeCity.gallery,
    stat: `City Atlas / Registry ${activeCity.adcode}`,
    breathImage: activeCity.gallery?.[0],
    breathQuote: activeCity.narrative,
  };

  const foodChapter: CityCultureSection | null = activeCity.foodImages.length > 0
    ? {
        title: activeCity.food || "Local Flavours",
        body: activeCity.foodDescription,
        image: activeCity.foodImages[0],
        images: activeCity.foodImages,
        stat: "Local Flavours",
        breathImage: activeCity.foodImages[1] ?? activeCity.foodImages[0],
      }
    : null;

  const bookSections: CityCultureSection[] = [
    coverChapter,
    ...activeCity.sections,
    ...(foodChapter ? [foodChapter] : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grain">
      <section
        id="section-masthead"
        className="relative bg-[var(--paper-deep)] bg-grain"
      >
        <div className="site-container py-10 lg:py-14">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-[var(--cinnabar)]" />
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    City Atlas / {activeCity.label}
                  </p>
                </div>
                <h1 className="mt-3 font-[family:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-[var(--river-deep)] md:text-6xl lg:text-7xl">
                  {activeCity.name}
                </h1>
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeCity.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="border border-[var(--line)] bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={`/community?compose=1&location=${encodeURIComponent(activeCity.name)}&channel=Culture%20Desk&title=${encodeURIComponent(activeCity.name)}&note=${encodeURIComponent(`City note from ${activeCity.name}: `)}`}
                    className="btn-outline px-5 py-3 text-[11px]"
                  >
                    Post city note
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 self-start lg:self-end">
                <div className="-rotate-1 border border-[var(--line)] bg-white px-4 py-3 scrapbook-shadow justify-self-start lg:justify-self-end">
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--gold)]">Registry</p>
                  <p className="font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">
                    {activeCity.adcode}
                  </p>
                </div>
                {linkedRoute ? (
                  <Link
                    href={`/routes/${linkedRoute.slug}`}
                    className="group border border-[var(--line)] bg-white/90 p-4 scrapbook-shadow transition-all hover:-rotate-1 hover:border-[var(--cinnabar)] lg:max-w-[22rem]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                      Linked Route
                    </p>
                    <p className="mt-2 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)]">
                      {linkedRoute.title}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="bg-[var(--river-deep)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                        {linkedRoute.culture}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {linkedRoute.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)] line-clamp-2">
                      {linkedRoute.summary}
                    </p>
                    <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] transition group-hover:translate-x-1">
                      <span>Open linked route</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </p>
                  </Link>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>

        <div id="section-chapters" className="pb-10 lg:pb-14">
          <CityArchivalBook
            cityName={activeCity.name}
            sections={bookSections}
            fallbackImage={activeCity.image}
            showIntro={false}
            immersive
          />
        </div>

        <div
          id="section-cities"
          className="site-container border-t border-[var(--line)]/60 pt-10 lg:pt-14"
        >
          <Reveal>
            <p className="mb-4 text-label text-[var(--cinnabar)] handwritten">
              {showRoutes ? "Continue the dispatch" : "Nearby in the same archive"}
            </p>
            <h2 className="max-w-4xl font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] md:text-5xl">
              {showRoutes ? (
                <>
                  Step out of <span className="italic text-[var(--gold)]">{activeCity.name}</span> and into its linked route.
                </>
              ) : (
                <>
                  Places that continue the story around <span className="italic text-[var(--gold)]">{activeCity.name}</span>.
                </>
              )}
            </h2>
          </Reveal>

          {showRoutes ? (
            <RelatedRouteHub
              routes={relatedRoutes}
              cityAdcode={activeCity.adcode}
              cityName={activeCity.name}
            />
          ) : (
            <RelatedCitiesHub allCities={cityCultures ?? []} currentCity={activeCity} />
          )}
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--paper-deep)] bg-grain py-16">
        <div className="site-container">
          <Reveal>
            <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
              <div className="w-full sm:w-auto">
                {(() => {
                  const idx = (cityCultures ?? []).findIndex((item) => item.slug === activeCity.slug);
                  const prev = idx > 0 ? (cityCultures ?? [])[idx - 1] : null;
                  const href = prev ? `/culture/${prev.slug}` : "/culture";
                  const label = prev ? prev.name : (activeLocale === "zh" ? "全部城市" : "All cities");
                  return (
                    <Link
                      href={href}
                      className="group flex items-center gap-6 border-8 border-white bg-white p-6 scrapbook-shadow transition-all hover:rotate-1 hover:border-[var(--cinnabar)]"
                    >
                      <svg className="h-6 w-6 shrink-0 text-[var(--cinnabar)] transition-transform group-hover:-translate-x-2" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--cinnabar)]">
                          {activeLocale === "zh" ? "上一份档案" : "Previous Archive"}
                        </p>
                        <p className="mt-1 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{label}</p>
                      </div>
                    </Link>
                  );
                })()}
              </div>

              <div className="w-full sm:w-auto">
                {(() => {
                  const idx = (cityCultures ?? []).findIndex((item) => item.slug === activeCity.slug);
                  const next = idx < (cityCultures ?? []).length - 1 ? (cityCultures ?? [])[idx + 1] : null;
                  const href = next ? `/culture/${next.slug}` : "/culture";
                  const label = next ? next.name : (activeLocale === "zh" ? "全部城市" : "All cities");
                  return (
                    <Link
                      href={href}
                      className="group flex items-center gap-6 border-8 border-white bg-white p-6 scrapbook-shadow transition-all -rotate-1 hover:rotate-0 hover:border-[var(--cinnabar)]"
                    >
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--cinnabar)]">
                          {activeLocale === "zh" ? "下一份档案" : "Next Archive"}
                        </p>
                        <p className="mt-1 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{label}</p>
                      </div>
                      <svg className="h-6 w-6 shrink-0 text-[var(--cinnabar)] transition-transform group-hover:translate-x-2" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  );
                })()}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
