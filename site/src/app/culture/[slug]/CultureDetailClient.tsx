"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchCityBySlug, fetchCities } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryStack } from "@/components/culture/GalleryStack";
import { ArticleSplitScreen } from "@/components/culture/ArticleSplitScreen";
import { BreathingPoint } from "@/components/culture/BreathingPoint";
import { FoodCollage } from "@/components/culture/FoodCollage";
import { SectionProgress } from "@/components/culture/SectionProgress";
import { RelatedCitiesHub } from "@/components/culture/RelatedCitiesHub";
import type { CityCulture } from "@/data/culture";

export function CultureDetailClient({ slug }: { slug: string }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<CityCulture>("city");
  const activeLocale = previewLocale ?? locale;

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

  const activeCity = previewData ?? city;

  if (previewEnabled && !activeCity) {
    return <LoadingSpinner text="Loading preview..." />;
  }

  if (loading && !activeCity) return <LoadingSpinner text="Loading city..." />;
  if (error && !activeCity) return <ErrorState message={error} />;

  if (!activeCity) {
    router.push("/culture");
    return null;
  }

  const foodImages = activeCity.foodImages;

  const progressSections = [
    { id: "section-hero", label: "Overview" },
    { id: "section-intro", label: "Intro" },
    ...activeCity.sections.map((section, index) => ({
      id: `section-${index}`,
      label: section.title,
    })),
    { id: "section-food", label: "Food" },
    { id: "section-cities", label: "Cities" },
  ];

  const summaryParts = activeCity.summary.split("\n\n");
  const hasSummaryTitle = summaryParts[0].startsWith("## ");
  const displaySummaryTitle = hasSummaryTitle ? summaryParts[0].replace("## ", "") : null;
  const displaySummaryBody = hasSummaryTitle ? summaryParts.slice(1).join("\n\n") : activeCity.summary;

  return (
    <div className="bg-[var(--background)] bg-grain min-h-screen">
      <SectionProgress sections={progressSections} />

      <section id="section-hero" className="relative min-h-[85svh] overflow-hidden lg:min-h-screen">
        <div className="site-container relative flex min-h-[85svh] flex-col items-center justify-center lg:min-h-screen">
          <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="z-10 lg:col-span-7">
              <Reveal>
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-px w-12 bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    City Atlas / {activeCity.label}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-6xl leading-[0.85] tracking-tight text-[var(--river-deep)] md:text-8xl lg:text-9xl">
                  {activeCity.name}
                </h1>
                <p className="mt-10 max-w-xl text-xl leading-relaxed text-[var(--muted)] handwritten">
                  {activeCity.narrative}
                </p>
              </Reveal>
            </div>

            <div className="relative lg:col-span-5">
              <Reveal delay={200}>
                <div className="relative aspect-[3/4] rotate-2 overflow-hidden border-[12px] border-white bg-white scrapbook-shadow transition-transform duration-700 hover:rotate-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
                    style={{ backgroundImage: `url(${activeCity.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute -top-4 left-1/2 z-20 h-10 w-32 -translate-x-1/2 -rotate-2 border border-black/5 bg-white/40 backdrop-blur-[2px]" />
                </div>

                <div className="absolute -bottom-10 -left-10 hidden -rotate-3 bg-white p-8 scrapbook-shadow md:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Registry Info</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{activeCity.adcode}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cinnabar)]" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]">Live Signal Tracking</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] [writing-mode:vertical-lr]">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-[var(--muted)]/40 to-transparent" />
        </div>
      </section>

      <section id="section-intro" className="py-20 lg:py-32">
        <div className="site-container">
          <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal>
              <div className="relative">
                <div className="absolute -left-8 -top-8 select-none font-[family:var(--font-display)] text-8xl text-[var(--gold)]/10">"</div>
                <p className="mb-6 text-label text-[var(--cinnabar)]">Introduction</p>
                {displaySummaryTitle && (
                  <h3 className="font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                    {displaySummaryTitle}
                  </h3>
                )}
                <p className={`mt-8 ${displaySummaryTitle ? "text-lg leading-relaxed text-[var(--muted)]" : "font-[family:var(--font-display)] text-3xl leading-snug text-[var(--river-deep)] md:text-4xl"}`}>
                  {displaySummaryBody}
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <GalleryStack images={activeCity.gallery} />
            </Reveal>
          </div>
        </div>
      </section>

      <div className="bg-grain">
        {activeCity.sections.map((section, index) => {
          const sectionId = `section-${index}`;
          return (
            <div key={section.title}>
                <ArticleSplitScreen
                title={section.title}
                body={section.body}
                image={section.image || activeCity.gallery[index % activeCity.gallery.length] || activeCity.image}
                align={index % 2 === 0 ? "left" : "right"}
                index={index}
                stat={section.stat}
                sectionId={sectionId}
              />

              {(section.breathImage || section.breathQuote) && (
                <BreathingPoint
                  image={section.breathImage || section.image || activeCity.image}
                  quote={section.breathQuote}
                  attribution={`${activeCity.name} / ${section.title}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <section id="section-food" className="bg-[var(--paper-deep)] bg-grain py-20 lg:py-32">
        <div className="site-container">
          <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal>
              <div className="relative">
                <p className="mb-6 text-label text-[var(--cinnabar)] handwritten">Local Flavours / {activeCity.name}</p>
                <p className="font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] sm:text-5xl md:text-6xl">
                  {activeCity.food}
                </p>
                <div className="mt-10 h-px w-20 bg-[var(--gold)]/40" />
                <p className="mt-10 text-lg leading-relaxed text-[var(--muted)]">
                  {activeCity.foodDescription}
                </p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <FoodCollage images={foodImages} />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="section-cities" className="border-t border-[var(--line)] bg-[var(--background)] bg-grain py-20 lg:py-32">
        <div className="site-container">
          <Reveal>
            <p className="mb-6 text-label text-[var(--cinnabar)] handwritten">Connected Cities / Discovery</p>
            <h2 className="font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-6xl">
              Cities that light up around <span className="italic text-[var(--gold)]">{activeCity.name}</span>
            </h2>
          </Reveal>

          <RelatedCitiesHub allCities={cityCultures ?? []} currentCity={activeCity} />
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
