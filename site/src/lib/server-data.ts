/**
 * Server-side data fetching for the home page.
 *
 * This module is imported ONLY by Server Components.
 * It mirrors the client-side `fetchHomeData` from `api-data.ts` but uses
 * the server-compatible `serverGet` helper instead of `window`-dependent `apiGet`.
 *
 * Returns the same `HomeData` shape so the client component can consume it directly.
 */

import { serverGet } from "./server-api";
import type { Locale } from "./locale";
import type { EventData, InterpretingData } from "./api-data";
import type { CityCulture } from "@/data/culture";
import type {
  Region,
  RegionSlug,
  CultureFeature,
  Testimonial,
  TrustMetric,
  HomeHero,
  HomeHeroStat,
  HomeEntryCard,
} from "@/types/content";
import type { StoryRoute } from "@/data/routes";
import type { StoreCollection, StoreProduct } from "@/data/store";
import { SEED_IMAGES } from "./seed-images";
import { placeholderFor } from "./placeholders";
import {
  DEFAULT_ROUTE_REGIONS,
  pickRouteRegionText,
  type RouteRegion,
} from "./route-regions";
import {
  hasVisibleCityContent,
  hasVisibleRegionContent,
  sanitizeCityCulture,
  sanitizeRegion,
} from "./content-cleaners";

// 鈹€鈹€ Shared helpers (duplicated from api-data.ts to avoid importing client code) 鈹€鈹€

function pickLocalized(
  val: string | { en?: string; zh?: string } | undefined,
  _locale: Locale,
  fallback = "",
): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    return val.en ?? val.zh ?? fallback;
  }
  return fallback;
}

// 鈹€鈹€ API response types (subset needed for home page) 鈹€鈹€

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

interface ApiRouteStop {
  id: string;
  sortOrder: number;
  time: string;
  stopName: string;
  plan?: string;
  story: string;
  culturalStory: string;
  details: string[];
  image: string;
  lat: number | null;
  lng: number | null;
  meal: string | null;
  hotel: string | null;
  transit: string | null;
  placeDetail?: string;
  images?: string[];
}

interface ApiStoryRoute {
  id: string;
  slug: string;
  title: string;
  cultureTag: string;
  cityName: string;
  duration: string;
  audience: string;
  summary: string;
  story: string;
  coverImage: string;
  routeRegionKey?: string | null;
  stops: ApiRouteStop[];
  routeCityLinks?: { citySlug: string }[];
}

interface ApiCitySection {
  id: string;
  title: string;
  body: string;
  image: string;
  images?: string[];
  statLabel: string | null;
  statValue: string | null;
  breathImage: string | null;
  breathQuote: string | null;
  sortOrder: number;
}

interface ApiCity {
  id: string;
  slug: string;
  name: string;
  regionLabel: string;
  heroImage: string;
  heroNarrative: string;
  tags: string[];
  editorIntro: string;
  galleryImages: string[];
  foodTitle: string;
  foodDescription: string;
  foodImages: string[];
  adcode?: number;
  sections: ApiCitySection[];
  routes?: { slug: string }[];
  relatedCitySlugs?: string[];
}

type LocalizedText = string | { en?: string; zh?: string };

interface ApiHomeConfig {
  hero?: {
    image?: string;
    caption?: LocalizedText;
    ctaImage?: string;
    badge?: { value?: string; label?: LocalizedText };
    interpretingLabel?: LocalizedText;
    interpretingImage?: string;
    stats?: Array<{ title: LocalizedText; description: LocalizedText }>;
  };
  heroStats?: Array<{ title: LocalizedText; description: LocalizedText }>;
  trustMetrics?: Array<{ value: string; label: LocalizedText }>;
  entryCards?: Array<{
    id: string;
    title: LocalizedText;
    body: LocalizedText;
    href: string;
    image?: string;
  }>;
  cultureHighlights?: Array<{
    slug: string;
    title: LocalizedText;
    body: LocalizedText;
    href?: string;
    image?: string;
  }>;
  testimonials?: Array<{ quote: LocalizedText; name: LocalizedText }>;
  featuredRouteSlugs?: string[];
  routeRegions?: Array<{
    key: string;
    title: LocalizedText;
    note: LocalizedText;
    adcodes: number[];
  }>;
}

interface ApiStoreProduct {
  id: string;
  slug: string;
  price: number;
  currency: string;
  image: string;
  gallery: string[];
  collection: { slug: string; title: string } | null;
  product: { name: string; tag: string };
  materialNotes: string | null;
  story: string;
}

interface ApiStoreCollection {
  id: string;
  slug: string;
  title: string;
  routeName: string;
  routeSlug: string;
  image: string;
  body: string;
}

interface ApiEvent {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  description?: LocalizedText;
  city: string;
  citySlug: string;
  date: string;
  endDate?: string | null;
  tags: string[];
  image: string | null;
  status: string;
  relatedRouteSlugs: string[];
}

// 鈹€鈹€ Mappers (subset needed for home page) 鈹€鈹€

function mapRoute(apiRoute: ApiStoryRoute): StoryRoute {
  const routeFallbackImage =
    apiRoute.slug === "southern-sea-table"
      ? "/editorial/guangdong-coast-hero.jpg"
      : apiRoute.slug === "chaoshan-tea-culture"
        ? "/editorial/pottery-painting.jpg"
        : SEED_IMAGES.routesHero ?? placeholderFor("hero");

  return {
    slug: apiRoute.slug,
    title: apiRoute.title,
    culture: apiRoute.cultureTag as StoryRoute["culture"],
    city: apiRoute.cityName,
    duration: apiRoute.duration,
    audience: apiRoute.audience,
    summary: apiRoute.summary,
    story: apiRoute.story,
    image: apiRoute.coverImage || routeFallbackImage,
    citySlugs: apiRoute.routeCityLinks?.map((l) => l.citySlug) ?? [],
    routeRegionKey: apiRoute.routeRegionKey ?? undefined,
    mapViewBox: "0 0 900 600",
    itinerary: (apiRoute.stops ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        time: s.time,
        stop: s.stopName,
        plan: s.plan ?? "",
        story: s.story,
        culturalStory: s.culturalStory,
        details: s.details ?? [],
        image: s.image || routeFallbackImage,
        images: [
          ...(s.images ?? []),
          s.image,
          routeFallbackImage,
        ].filter((image): image is string => Boolean(image?.trim())),
        lat: s.lat ?? 0,
        lng: s.lng ?? 0,
        meal: s.meal ?? undefined,
        hotel: s.hotel ?? undefined,
        transit: s.transit ?? undefined,
        placeDetail: s.placeDetail ?? undefined,
      })),
  };
}

function mapProduct(p: ApiStoreProduct): StoreProduct {
  return {
    slug: p.slug,
    name: p.product.name,
    tag: p.product.tag,
    price: p.price,
    currency: (p.currency as StoreProduct["currency"]) ?? "CNY",
    image: p.image,
    gallery: p.gallery ?? [],
    collection: p.collection?.title ?? "",
    materialNotes: p.materialNotes ?? undefined,
    story: p.story,
  };
}

function mapCollection(c: ApiStoreCollection): StoreCollection {
  return {
    title: c.title,
    route: c.routeName,
    href: `/routes/${c.routeSlug}`,
    image: c.image,
    body: c.body,
  };
}

// EventData is imported from "./api-data" (see top of file)

function mapEvent(raw: ApiEvent, locale: Locale): EventData {
  const eventFallbackImage =
    raw.citySlug === "chaozhou"
      ? "/editorial/pottery-painting.jpg"
      : raw.citySlug === "zhanjiang"
        ? "/editorial/guangdong-coast-hero.jpg"
        : "/editorial/guangdong-coast-rocky.jpg";

  return {
    id: raw.id,
    slug: raw.slug,
    title: pickLocalized(raw.title, locale),
    date: raw.date,
    city: raw.city,
    citySlug: raw.citySlug,
    tags: raw.tags ?? [],
    summary: pickLocalized(raw.summary, locale),
    description: raw.description
      ? pickLocalized(raw.description, locale)
      : "",
    relatedRouteSlugs: raw.relatedRouteSlugs ?? [],
    image: raw.image || eventFallbackImage,
  };
}

// Re-export EventData for consumers (type-only import, no runtime dependency)
export type { EventData } from "./api-data";

// 鈹€鈹€ Public data types (same as HomeData from api-data.ts) 鈹€鈹€

export interface HomeData {
  hero: HomeHero;
  heroStats: HomeHeroStat[];
  regionShowcase: Region[];
  cultureHighlights: CultureFeature[];
  testimonials: Testimonial[];
  trustMetrics: TrustMetric[];
  homeEntryCards: HomeEntryCard[];
}

// 鈹€鈹€ Server-side fetch functions 鈹€鈹€

export async function fetchRoutesServer(locale: Locale): Promise<StoryRoute[]> {
  const res = await serverGet<PaginatedResponse<ApiStoryRoute>>(
    "/public/routes",
    { page: 1, limit: 50, lang: locale },
    locale,
  );
  return res.data.map(mapRoute);
}

export async function fetchCitiesServer(locale: Locale): Promise<Region[]> {
  const res = await serverGet<PaginatedResponse<ApiCity>>(
    "/public/cities",
    { page: 1, limit: 50, lang: locale },
    locale,
  );
  return res.data
    .map((c) => {
      const cityFallbackImage =
        c.slug === "chaozhou"
          ? "/editorial/pottery-workshop.jpg"
          : c.slug === "zhanjiang"
            ? "/editorial/guangdong-coast-boat.jpg"
            : "/editorial/guangdong-coast-rocky.jpg";
      const gallery = [
        ...(c.galleryImages ?? []),
        c.heroImage,
        cityFallbackImage,
      ].filter((image): image is string => Boolean(image?.trim()));

      return sanitizeRegion({
        slug: c.slug as RegionSlug,
        adcode: c.adcode ?? 0,
        name: c.name,
        label: c.regionLabel,
        summary: c.heroNarrative,
        narrative: c.editorIntro,
        tags: c.tags,
        food: c.foodDescription ?? "",
        routeSlugs: c.routes?.map((r) => r.slug) ?? [],
        image: c.heroImage || gallery[0] || cityFallbackImage,
        gallery,
        serviceLabel: "",
        serviceHref: "/interpreting",
      });
    })
    .filter(hasVisibleRegionContent);
}

export async function fetchCityCulturesServer(
  locale: Locale,
): Promise<CityCulture[]> {
  const res = await serverGet<PaginatedResponse<ApiCity>>(
    "/public/cities",
    { page: 1, limit: 50, lang: locale },
    locale,
  );

  return res.data
    .map((c) => {
      const cityFallbackImage =
        c.slug === "chaozhou"
          ? "/editorial/pottery-workshop.jpg"
          : c.slug === "zhanjiang"
            ? "/editorial/guangdong-coast-boat.jpg"
            : "/editorial/guangdong-coast-rocky.jpg";
      const gallery = [
        ...(c.galleryImages ?? []),
        c.heroImage,
        cityFallbackImage,
      ].filter((image): image is string => Boolean(image?.trim()));

      return sanitizeCityCulture({
        slug: c.slug,
        name: c.name,
        adcode: c.adcode ?? 0,
        label: c.regionLabel,
        summary: c.editorIntro ?? "",
        narrative: c.heroNarrative,
        image: c.heroImage || gallery[0] || cityFallbackImage,
        gallery,
        tags: c.tags ?? [],
        food: c.foodTitle,
        foodDescription: c.foodDescription ?? "",
        routeSlugs: c.routes?.map((r) => r.slug) ?? [],
        relatedCitySlugs: c.relatedCitySlugs ?? [],
        foodImages: c.foodImages ?? [],
        sections:
          c.sections?.map((s) => ({
            title: s.title,
            body: s.body,
            image: s.image || cityFallbackImage,
            images:
              [
                ...(s.images ?? []),
                s.image,
                s.breathImage,
                cityFallbackImage,
              ].filter((image): image is string => Boolean(image?.trim())),
            stat:
              [s.statLabel, s.statValue].filter(Boolean).join(" / ") ||
              undefined,
            breathImage: s.breathImage ?? s.image ?? cityFallbackImage,
            breathQuote: s.breathQuote ?? undefined,
          })) ?? [],
      });
    })
    .filter(hasVisibleCityContent);
}

/**
 * Server-side home data fetch 鈥?mirrors fetchHomeData from api-data.ts
 * but uses serverGet instead of the window-dependent apiGet.
 */
export async function fetchHomeDataServer(locale: Locale): Promise<HomeData> {
  const [routesResult, citiesResult, homeConfigResult] =
    await Promise.allSettled([
      fetchRoutesServer(locale),
      fetchCitiesServer(locale),
      serverGet<ApiHomeConfig>("/public/home", { rawI18n: "true" }, locale),
    ]);

  const routes = routesResult.status === "fulfilled" ? routesResult.value : [];
  const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
  const homeConfig =
    homeConfigResult.status === "fulfilled"
      ? homeConfigResult.value
      : ({} as ApiHomeConfig);

  const hero: HomeHero = {
    image: homeConfig.hero?.image,
    caption: pickLocalized(homeConfig.hero?.caption, locale),
    ctaImage: homeConfig.hero?.ctaImage,
    badge: homeConfig.hero?.badge
      ? {
          value: homeConfig.hero.badge.value ?? "",
          label: pickLocalized(homeConfig.hero.badge.label, locale),
        }
      : undefined,
    interpretingLabel: homeConfig.hero?.interpretingLabel
      ? pickLocalized(homeConfig.hero.interpretingLabel, locale)
      : undefined,
    interpretingImage: homeConfig.hero?.interpretingImage,
  };

  const featured =
    routes.find((r) => homeConfig.featuredRouteSlugs?.includes(r.slug)) ??
    routes[0];

  const regionShowcase: Region[] = cities
    .map((c) =>
      sanitizeRegion({
        ...c,
        serviceLabel: `Book ${c.name} Support`,
      }),
    )
    .filter(hasVisibleRegionContent);

  const cultureHighlightsFromApi = (homeConfig.cultureHighlights ?? []).map(
    (item) => ({
      slug: item.slug,
      title: pickLocalized(item.title, locale),
      body: pickLocalized(item.body, locale),
      href: item.href ?? `/culture/${item.slug}`,
      image: item.image || undefined,
    }),
  );

  const cultureHighlights: CultureFeature[] =
    cultureHighlightsFromApi.length > 0
      ? cultureHighlightsFromApi
      : regionShowcase.slice(0, 3).map((c) => ({
          slug: c.slug,
          title: c.name,
          body: c.summary ?? "",
          href: `/culture/${c.slug}`,
        }));

  const testimonials: Testimonial[] = (
    homeConfig.testimonials ?? [
      {
        quote:
          "I arrived knowing nothing. I left understanding why every dish on the table mattered.",
        name: "A Coastal Guest",
      },
    ]
  ).map((t) => ({
    quote: pickLocalized(t.quote, locale),
    name: pickLocalized(t.name, locale),
  }));

  const trustMetrics: TrustMetric[] = (
    homeConfig.trustMetrics ?? [
      { value: String(cities.length || 1), label: { en: "cities", zh: "城市" } },
      {
        value: String(routes.length || 1),
        label: { en: "story routes", zh: "故事路线" },
      },
    ]
  ).map((m) => ({
    value: m.value,
    label: pickLocalized(m.label, locale),
  }));

  // heroStats: admin stores these as hero.stats (nested) or heroStats (top-level)
  const rawHeroStats = homeConfig.hero?.stats ?? homeConfig.heroStats ?? [];
  const heroStats: HomeHeroStat[] = rawHeroStats.map((s) => ({
    title: pickLocalized(s.title, locale),
    body: pickLocalized(s.description, locale),
  }));

  // entryCards: quick-access editorial links (e.g. "Explore Routes", "Book Interpreting")
  const homeEntryCards: HomeEntryCard[] =
    homeConfig.entryCards?.map((item) => ({
      id: item.id,
      title: pickLocalized(item.title, locale),
      body: pickLocalized(item.body, locale),
      href: item.href,
      image: item.image || undefined,
    })) ?? [];

  return { hero, heroStats, regionShowcase, cultureHighlights, testimonials, trustMetrics, homeEntryCards };
}

/**
 * Server-side store products fetch.
 */
export async function fetchStoreProductsServer(
  locale: Locale,
): Promise<StoreProduct[]> {
  try {
    const res = await serverGet<{ data: ApiStoreProduct[] }>(
      "/public/shop/products",
      { page: 1, limit: 50, lang: locale },
      locale,
    );
    return (res.data ?? []).map(mapProduct);
  } catch {
    return [];
  }
}


export async function fetchStoreCollectionsServer(
  locale: Locale,
): Promise<StoreCollection[]> {
  try {
    const res = await serverGet<{ data: ApiStoreCollection[] }>(
      "/public/shop/collections",
      { lang: locale },
      locale,
    );
    return (res.data ?? []).map(mapCollection);
  } catch {
    return [];
  }
}
/**
 * Server-side routes fetch.
 */
export async function fetchRoutesServerForHome(
  locale: Locale,
): Promise<StoryRoute[]> {
  try {
    return await fetchRoutesServer(locale);
  } catch {
    return [];
  }
}

/**
 * Server-side events fetch.
 */
export async function fetchEventsServer(locale: Locale): Promise<EventData[]> {
  try {
    const res = await serverGet<{ data: ApiEvent[] }>(
      "/public/events",
      { page: 1, limit: 50 },
      locale,
    );
    return (res.data ?? []).map((item) => mapEvent(item, locale));
  } catch {
    return [];
  }
}

export async function fetchInterpretingServer(
  locale: Locale,
): Promise<InterpretingData> {
  try {
    const res = await serverGet<{
      service_modes: InterpretingData["serviceModes"];
      profiles: InterpretingData["profiles"];
      faqs: InterpretingData["faqs"];
    }>("/public/interpreting", { lang: locale }, locale);

    return {
      serviceModes: res.service_modes ?? [],
      profiles: res.profiles ?? [],
      faqs: res.faqs ?? [],
    };
  } catch {
    return {
      serviceModes: [],
      profiles: [],
      faqs: [],
    };
  }
}
