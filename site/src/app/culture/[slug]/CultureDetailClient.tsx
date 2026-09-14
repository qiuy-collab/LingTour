"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchCityBySlug, fetchCities, fetchRoutes } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { ErrorState, LoadingSpinner, useApiQuery } from "@/lib/use-api-query";
import { MarkdownRenderer } from "@/components/culture/MarkdownRenderer";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { RelatedCitiesHub } from "@/components/culture/RelatedCitiesHub";
import { RelatedRouteHub } from "@/components/culture/RelatedRouteHub";
import type { StoryRoute } from "@/data/routes";
import type { CityCulture } from "@/data/culture";

type CultureDetailClientProps = {
  slug: string;
  initialCity: CityCulture | null;
  initialCityCultures: CityCulture[];
  initialRoutes: StoryRoute[];
  previewOnly?: boolean;
};

export function CultureDetailClient({ slug, initialCity, initialCityCultures, initialRoutes, previewOnly = false }: CultureDetailClientProps) {
  const { t } = useLocale();
  const { previewData, previewEnabled } = usePreviewBridge<CityCulture>("city");
  const { data: city, loading, error } = useApiQuery(() => fetchCityBySlug(slug), [slug], {
    initialData: initialCity, revalidateOnMount: false, enabled: !previewOnly,
  });
  const { data: cities } = useApiQuery(() => fetchCities(), [], { initialData: initialCityCultures, revalidateOnMount: previewOnly });
  const { data: routes } = useApiQuery(() => fetchRoutes(), [], { initialData: initialRoutes, revalidateOnMount: previewOnly });
  const activeCity = previewData ?? city;

  if (previewOnly && !previewData) return <LoadingSpinner text="Loading preview..." />;
  if (previewEnabled && !previewData) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeCity) return <LoadingSpinner text="Opening the city..." />;
  if (error && !activeCity) return <ErrorState title="City file unavailable" message="This city cannot be reached right now. Please try again shortly." />;
  if (!activeCity) notFound();

  const relatedRoutes = (routes ?? []).filter(route => activeCity.routeSlugs.includes(route.slug));
  const index = (cities ?? []).findIndex(item => item.slug === activeCity.slug);
  const previous = index > 0 ? cities?.[index - 1] : undefined;
  const next = index >= 0 ? cities?.[index + 1] : undefined;
  const isSummaryInArticle = Boolean(
    activeCity.summary && activeCity.contentMarkdown?.includes(activeCity.summary),
  );
  const isMediaInArticle = Boolean(
    activeCity.primaryMedia && activeCity.contentMarkdown?.includes(activeCity.primaryMedia.url),
  );

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[var(--background)] bg-grain text-[var(--river-deep)]">
      <header id="section-masthead" className="site-container relative pb-8 pt-8 sm:pb-10 lg:pb-12 lg:pt-12">
        <div className="relative z-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,0.88fr)] lg:items-center lg:gap-12">
          <div className="order-2 min-w-0 lg:order-none">
            <Link href="/culture" className="relative z-20 mx-2 -mt-8 mb-2 inline-flex min-h-11 items-center bg-[var(--background)] px-1 text-sm text-[var(--river-deep)] underline decoration-[var(--cinnabar)]/55 underline-offset-4 lg:mx-0 lg:mb-7 lg:mt-0 lg:bg-transparent lg:px-0">
              All cities
            </Link>
            <div className="relative z-10 mx-2 max-w-3xl border border-[var(--line)] bg-[var(--background)] p-4 scrapbook-shadow sm:mx-3 sm:p-5 lg:mx-0 lg:mt-0 lg:max-w-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
                {activeCity.label}
              </p>
              <h1 className="mt-3 max-w-full text-balance font-[family:var(--font-display)] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.04em] text-[var(--river-deep)]">
                {activeCity.name}
              </h1>
              {activeCity.summary && !isSummaryInArticle ? (
                <p className="mt-6 max-w-[65ch] text-lg leading-[1.7] text-[var(--river-deep)] sm:text-xl">
                  {activeCity.summary}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
                {activeCity.publishedAt ? (
                  <time dateTime={activeCity.publishedAt}>
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(activeCity.publishedAt))}
                  </time>
                ) : null}
                {activeCity.tags.length > 0 ? <span>{activeCity.tags.join(" / ")}</span> : null}
                <Link href={`/community?compose=1&location=${encodeURIComponent(activeCity.name)}&channel=Culture%20Desk&title=${encodeURIComponent(activeCity.name)}&note=${encodeURIComponent(`City note from ${activeCity.name}: `)}`} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline decoration-[var(--cinnabar)]/55 underline-offset-4">
                  Post city note
                </Link>
              </div>
            </div>
          </div>

          {activeCity.primaryMedia && !isMediaInArticle ? (
            <div className="relative order-1 min-w-0 lg:order-none lg:pb-2">
              <div className="relative aspect-[4/3] overflow-hidden border-[0.5rem] border-white bg-[var(--paper)] scrapbook-shadow sm:border-8 lg:-rotate-2">
                <MediaFrame asset={activeCity.primaryMedia} alt={activeCity.name} mode={activeCity.primaryMedia.type === "video" ? "interactive" : "image"} eager />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <article id="section-chapters" aria-label={`${activeCity.name} city article`} className="relative py-12 sm:py-16 lg:py-24">
        <div className="relative site-container">
          <MarkdownRenderer content={activeCity.contentMarkdown ?? ""} />
        </div>
      </article>

      <section id="section-cities" className="site-container py-14 sm:py-20">
        <div className="max-w-3xl">
          <h2 className="text-balance font-[family:var(--font-display)] text-3xl leading-[0.98] text-[var(--river-deep)] sm:text-4xl">
            {relatedRoutes.length ? t("culture.detail.routeLinks") : t("culture.detail.nearbyCities")}
          </h2>
        </div>
        {relatedRoutes.length ? <RelatedRouteHub routes={relatedRoutes} cityAdcode={activeCity.adcode} cityName={activeCity.name} cities={cities ?? []} /> : <RelatedCitiesHub allCities={cities ?? []} currentCity={activeCity} />}
      </section>

      <nav aria-label="City archives" className="site-container flex flex-wrap justify-between gap-6 border-t border-[var(--line)] py-8">
        <Link href={previous ? `/culture/${previous.slug}` : "/culture"} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline decoration-[var(--cinnabar)]/55 underline-offset-4">
          {previous ? `Previous: ${previous.name}` : "All cities"}
        </Link>
        {next ? (
          <Link href={`/culture/${next.slug}`} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline decoration-[var(--cinnabar)]/55 underline-offset-4">
            Next: {next.name}
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
