import { Suspense } from "react";
import { fetchRoutes } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

const SEEDED_ROUTE_SLUGS = ["southern-sea-table"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(SEEDED_ROUTE_SLUGS);

  for (const locale of locales) {
    try {
      const routes = await fetchRoutes(locale);
      for (const route of routes) {
        slugSet.add(route.slug);
      }
    } catch {
      // Keep build coverage from seeded route slugs when the API is not reachable.
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
  return (
    <Suspense fallback={null}>
      <RouteDetailClient slug={slug} />
    </Suspense>
  );
}
