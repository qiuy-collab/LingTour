import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { fetchCities } from "@/lib/api-data";
import {
  fetchCityCultureBySlugServer,
  fetchCityCulturesServer,
  fetchRoutesServer,
} from "@/lib/server-data";

const SEEDED_CITY_SLUGS = ["zhanjiang"];
const getCity = cache(fetchCityCultureBySlugServer);

export const revalidate = 60;

export async function generateStaticParams() {
  const slugSet = new Set(SEEDED_CITY_SLUGS);

  try {
    const cities = await fetchCities();
    for (const city of cities) {
      slugSet.add(city.slug);
    }
  } catch {
    // Keep build coverage from seeded city slugs when the API is not reachable.
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) return {};

  const title = `${city.name} | Culture & Cities | LingTour Guangdong`;
  const description =
    city.summary?.trim() ||
    city.narrative?.trim() ||
    `${city.name} in Guangdong — its food, craft, and living memory, read on the ground.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: city.image ? [{ url: city.image }] : undefined,
    },
  };
}

export default async function CityCulturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [initialCity, initialCityCultures, initialRoutes] = await Promise.all([
    getCity(slug),
    fetchCityCulturesServer(),
    fetchRoutesServer(),
  ]);
  const { CultureDetailClient } = await import("./CultureDetailClient");
  return (
    <Suspense fallback={null}>
      <CultureDetailClient
        slug={slug}
        initialCity={initialCity}
        initialCityCultures={initialCityCultures}
        initialRoutes={initialRoutes}
      />
    </Suspense>
  );
}
