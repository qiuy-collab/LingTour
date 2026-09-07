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
  if (error && !activeCity) return <ErrorState title="City file unavailable" message="This city's archive can't be reached right now. Please try again shortly." />;
  if (!activeCity) notFound();

  const relatedRoutes = (routes ?? []).filter(route => activeCity.routeSlugs.includes(route.slug));
  const index = (cities ?? []).findIndex(item => item.slug === activeCity.slug);
  const previous = index > 0 ? cities?.[index - 1] : undefined;
  const next = index >= 0 ? cities?.[index + 1] : undefined;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header id="section-masthead" className="site-container pb-10 pt-8 sm:pb-14 lg:pt-14">
        <Link href="/culture" className="inline-flex min-h-11 items-center text-sm text-[var(--river-deep)] underline underline-offset-4">All cities</Link>
        <div className="mt-5 max-w-4xl">
          <p className="text-sm text-[var(--muted)]">{activeCity.label}</p>
          <h1 className="mt-3 text-balance font-[family:var(--font-display)] text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.05] text-[var(--river-deep)]">{activeCity.name}</h1>
          {activeCity.summary && !activeCity.contentMarkdown?.includes(activeCity.summary) && <p className="mt-6 max-w-[65ch] text-lg leading-[1.75] text-[var(--river-deep)]">{activeCity.summary}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
            {activeCity.publishedAt && <time dateTime={activeCity.publishedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(activeCity.publishedAt))}</time>}
            {activeCity.tags.length > 0 && <span>{activeCity.tags.join(" / ")}</span>}
            <Link href={`/community?compose=1&location=${encodeURIComponent(activeCity.name)}&channel=Culture%20Desk&title=${encodeURIComponent(activeCity.name)}&note=${encodeURIComponent(`City note from ${activeCity.name}: `)}`} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline underline-offset-4">Post city note</Link>
          </div>
        </div>
      </header>

      <article id="section-chapters" aria-label={`${activeCity.name} city archive`} className="site-container pb-16 sm:pb-24">
        {activeCity.primaryMedia && !activeCity.contentMarkdown?.includes(activeCity.primaryMedia.url) && (
          <div className="mx-auto mb-10 aspect-[16/9] max-w-5xl overflow-hidden bg-[var(--paper)]">
            <MediaFrame asset={activeCity.primaryMedia} alt={activeCity.name} mode={activeCity.primaryMedia.type === "video" ? "interactive" : "image"} eager />
          </div>
        )}
        <MarkdownRenderer content={activeCity.contentMarkdown ?? ""} />
      </article>

      <section id="section-cities" className="site-container border-t border-[var(--line)] py-12 sm:py-16">
        <h2 className="text-balance font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] sm:text-4xl">{relatedRoutes.length ? t("culture.detail.routeLinks") : t("culture.detail.nearbyCities")}</h2>
        {relatedRoutes.length ? <RelatedRouteHub routes={relatedRoutes} cityAdcode={activeCity.adcode} cityName={activeCity.name} cities={cities ?? []} /> : <RelatedCitiesHub allCities={cities ?? []} currentCity={activeCity} />}
      </section>
      <nav aria-label="City archives" className="site-container flex flex-wrap justify-between gap-6 border-t border-[var(--line)] py-8">
        <Link href={previous ? `/culture/${previous.slug}` : "/culture"} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline underline-offset-4">{previous ? `Previous: ${previous.name}` : "All cities"}</Link>
        {next && <Link href={`/culture/${next.slug}`} className="inline-flex min-h-11 items-center text-[var(--river-deep)] underline underline-offset-4">Next: {next.name}</Link>}
      </nav>
    </div>
  );
}
