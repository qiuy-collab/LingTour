"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchCityBySlug, fetchCities, fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryStack } from "@/components/culture/GalleryStack";
import { ArticleSplitScreen } from "@/components/culture/ArticleSplitScreen";
import { BreathingPoint } from "@/components/culture/BreathingPoint";
import { FoodCollage } from "@/components/culture/FoodCollage";
import { SectionProgress } from "@/components/culture/SectionProgress";
import { RelatedRouteHub } from "@/components/culture/RelatedRouteHub";

export function CultureDetailClient({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const router = useRouter();

  const { data: city, loading, error } = useApiQuery(
    () => fetchCityBySlug(slug, locale),
    [slug, locale],
  );

  const { data: cityCultures } = useApiQuery(
    () => fetchCities(locale),
    [locale],
  );

  const { data: allRoutes } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Loading city…" />;
  if (error) return <ErrorState message={error} />;

  if (!city) {
    router.push("/culture");
    return null;
  }

  const storyRoutes = allRoutes ?? [];
  const routes = city.routeSlugs
    .map((slug) => storyRoutes.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => r != null);

  const articleStats = city.stats;
  const breathQuotes = city.quotes;
  const breathImages = city.breathImages;
  const foodImages = city.foodImages;

  const progressSections = [
    { id: "section-hero", label: "Overview" },
    { id: "section-intro", label: "Intro" },
    ...city.sections.map((s, i) => ({
      id: `section-${i}`,
      label: s.title,
    })),
    { id: "section-food", label: "Food" },
    { id: "section-route", label: "Route" },
  ];

  return (
    <div>
      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.12); }
          to   { transform: scale(1); }
        }
        .hero-zoom {
          animation: heroZoom 6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <SectionProgress sections={progressSections} />

      {/* ─── Section A: Hero ─── */}
      <section id="section-hero" className="relative min-h-[70svh] overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center hero-zoom"
          style={{ backgroundImage: `url(${city.image})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.92),rgba(17,25,35,0.48)_55%,rgba(17,25,35,0.18))]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(0deg,var(--background),transparent)]" />
        <div className="site-container relative flex min-h-[70svh] flex-col justify-end pb-16 pt-28 lg:pb-20 lg:pt-36">
          <Reveal>
            <p className="text-label text-white/58">{city.label}</p>
            <h1 className="mt-5 max-w-[16ch] font-[family:var(--font-display)] text-5xl leading-[1.04] md:text-7xl">
              {city.name}
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-white/76">{city.narrative}</p>
          </Reveal>
        </div>
      </section>

      {/* ─── Section B: Editorial Intro + Gallery ─── */}
      <section id="section-intro" className="site-container py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.62fr_1.38fr]">
          <Reveal>
            <div className="border-l-2 border-[var(--cinnabar)] pl-6 lg:pl-8">
              <p className="text-label text-[var(--muted)]">Introduction</p>
              <p className="mt-6 font-[family:var(--font-display)] text-2xl leading-[1.3] text-[var(--river-deep)] md:text-3xl">
                {city.summary}
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <GalleryStack images={city.gallery} />
          </Reveal>
        </div>
      </section>

      {/* ─── Section C: Split-screen articles + Breathing Points ─── */}
      <div>
        {city.sections.map((section, index) => {
          const sectionId = `section-${index}`;
          return (
            <div key={section.title}>
              <ArticleSplitScreen
                title={section.title}
                body={section.body}
                image={city.gallery[index % city.gallery.length] ?? city.image}
                align={index % 2 === 0 ? "left" : "right"}
                index={index}
                stat={articleStats[index]}
                sectionId={sectionId}
              />

              {index < city.sections.length - 1 && (
                <BreathingPoint
                  image={breathImages[index % breathImages.length]}
                  quote={breathQuotes[index]}
                  attribution={`${city.name} · ${section.title}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Section D: Food Showcase ─── */}
      <section id="section-food" className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <div className="grid items-center gap-10 lg:grid-cols-[0.62fr_1fr]">
            <Reveal>
              <div className="border-l-2 border-[var(--cinnabar)] pl-6 lg:pl-8">
                <p className="text-label text-[var(--cinnabar)]">Flavours of {city.name}</p>
                <p className="mt-6 font-[family:var(--font-display)] text-3xl leading-[1.15] text-[var(--river-deep)] sm:text-4xl md:text-5xl">
                  {city.food}
                </p>
                <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
                  From dawn seafood markets to late-night oyster stalls, every meal here carries the
                  taste of the coast. The catch dictates the menu, and the menu changes with the tide.
                </p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <FoodCollage images={foodImages} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Section E: Route Hub ─── */}
      <section id="section-route" className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <Reveal>
            <p className="text-label text-[var(--cinnabar)]">Explore {city.name}&apos;s Routes</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Story routes through {city.name}
            </h2>
          </Reveal>

          <RelatedRouteHub
            routes={routes}
            cityAdcode={city.adcode}
            cityName={city.name}
          />
        </div>
      </section>

      {/* ─── Section F: Previous / Next city navigation ─── */}
      <section className="border-t border-[var(--line)] bg-[var(--paper-deep)] py-12">
        <div className="site-container">
          <Reveal>
            <div className="flex items-center justify-between gap-4">
              <div>
                {(() => {
                  const idx = (cityCultures ?? []).findIndex((c) => c.slug === city.slug);
                  const prev = idx > 0 ? (cityCultures ?? [])[idx - 1] : null;
                  const href = prev ? `/culture/${prev.slug}` : "/culture";
                  const label = prev ? prev.name : "All cities";
                  return (
                    <Link
                      href={href}
                      className="group flex items-center gap-3 border border-[var(--line)] bg-white px-5 py-3 transition hover:border-[var(--cinnabar)]"
                    >
                      <svg className="h-4 w-4 shrink-0 text-[var(--cinnabar)]" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-left">
                        <p className="text-label text-[var(--muted)] group-hover:text-[var(--cinnabar)]">
                          {locale === "zh" ? "上一个" : "Previous"}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">{label}</p>
                      </div>
                    </Link>
                  );
                })()}
              </div>

              <div>
                {(() => {
                  const idx = (cityCultures ?? []).findIndex((c) => c.slug === city.slug);
                  const next = idx < (cityCultures ?? []).length - 1 ? (cityCultures ?? [])[idx + 1] : null;
                  const href = next ? `/culture/${next.slug}` : "/culture";
                  const label = next ? next.name : "All cities";
                  return (
                    <Link
                      href={href}
                      className="group flex items-center gap-3 border border-[var(--line)] bg-white px-5 py-3 transition hover:border-[var(--cinnabar)]"
                    >
                      <div className="text-right">
                        <p className="text-label text-[var(--muted)] group-hover:text-[var(--cinnabar)]">
                          {locale === "zh" ? "下一个" : "Next"}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">{label}</p>
                      </div>
                      <svg className="h-4 w-4 shrink-0 text-[var(--cinnabar)]" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
