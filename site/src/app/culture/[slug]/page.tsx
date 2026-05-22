import { Suspense } from "react";
import { fetchCities } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

const SEEDED_CITY_SLUGS = ["zhanjiang"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(SEEDED_CITY_SLUGS);

  for (const locale of locales) {
    try {
      const cities = await fetchCities(locale);
      for (const city of cities) {
        slugSet.add(city.slug);
      }
    } catch {
      // Keep build coverage from seeded city slugs when the API is not reachable.
    }
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export default async function CityCulturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { CultureDetailClient } = await import("./CultureDetailClient");
  return (
    <Suspense fallback={null}>
      <CultureDetailClient slug={slug} />
    </Suspense>
  );
}
