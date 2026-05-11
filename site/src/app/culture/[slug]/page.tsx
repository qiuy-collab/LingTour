import { fetchCities } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

// Hardcoded fallbacks from seed data — guarantees build succeeds without API
const FALLBACK_SLUGS = ["zhanjiang"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(FALLBACK_SLUGS);

  for (const locale of locales) {
    try {
      const cities = await fetchCities(locale);
      for (const city of cities) {
        slugSet.add(city.slug);
      }
    } catch {
      // API unavailable — fallback slugs cover the build
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
  return <CultureDetailClient slug={slug} />;
}
