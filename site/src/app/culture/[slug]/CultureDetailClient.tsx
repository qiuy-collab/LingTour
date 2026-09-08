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
    <main className="min-h-screen overflow-hidden bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <header id="section-masthead" className="site-container relative pb-12 pt-8 sm:pb-16 lg:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute right-0 top-12 hidden h-[26rem] w-[44%] -rotate-6 border border-[var(--gold)]/20 bg-white/20 lg:block" />
        <div className="relative z-10 grid gap-9 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Link href="/culture" className="inline-flex min-h-11 items-center text-sm text-[var(--river-deep)] underline decoration-[var(--cinnabar)]/55 underline-offset-4">
              All cities
            </Link>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
              {activeCity.label}
            </p>
            <h1 className="mt-3 max-w-4xl text-balance font-[family:var(--font-display)] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.04em] text-[var(--river-deep)]">
              {activeCity.name}
            </h1>
            {activeCity.summary && !isSummaryInArticle ? (
              <p className="mt-7 max-w-[65ch] text-lg leading-[1.75] text-[var(--river-deep)] sm:text-xl">
                {activeCity.summary}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
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

          {activeCity.primaryMedia && !isMediaInArticle ? (
            <div className="relative lg:col-span-5 lg:pb-2">
              <div className="relative aspect-[4/3] overflow-hidden border-[0.5rem] border-white bg-[var(--paper)] scrapbook-shadow sm:border-8 lg:-rotate-2">
                <MediaFrame asset={activeCity.primaryMedia} alt={activeCity.name} mode={activeCity.primaryMedia.type === "video" ? "interactive" : "image"} eager />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <article id="section-chapters" aria-label={`${activeCity.name} city article`} className="relative border-y border-[var(--line)]/80 bg-[var(--paper)]/64 py-12 sm:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.06]" />
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
