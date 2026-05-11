import { fetchRoutes } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

// Hardcoded fallbacks from seed data — guarantees build succeeds without API
const FALLBACK_SLUGS = ["southern-sea-table"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(FALLBACK_SLUGS);

  for (const locale of locales) {
    try {
      const routes = await fetchRoutes(locale);
      for (const route of routes) {
        slugSet.add(route.slug);
      }
    } catch {
      // API unavailable — fallback slugs cover the build
    }
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { RouteDetailClient } = await import("./RouteDetailClient");
  return <RouteDetailClient slug={slug} />;
}
