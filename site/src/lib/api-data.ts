/**
 * API Data Module
 *
 * Bridges backend API responses → frontend TypeScript types.
 * Each function:
 *  1. Calls the backend via apiClient
 *  2. Maps the response shape to the consumer type expected
 *  3. Returns a clean result (or throws on failure)
 *
 * Locale is passed via Accept–Language header (handled by apiClient).
 */

import { apiGet } from "./api-client";
import type { Locale } from "./locale";
import type {
  Region,
  RegionSlug,
  FeaturedRoute,
  CultureFeature,
  Testimonial,
  TrustMetric,
  HomeEntryCard,
} from "@/types/content";
import type { CityCulture } from "@/data/culture";
import type { StoryRoute } from "@/data/routes";
import type { StoreCollection, StoreProduct } from "@/data/store";

// ───────────── Internal API response types ─────────────

interface ApiRouteStop {
  id: string;
  sortOrder: number;
  time: string;
  stopName: string;
  plan: string;
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
  stops: ApiRouteStop[];
  routeCityLinks?: { citySlug: string }[];
}

interface ApiCitySection {
  id: string;
  title: string;
  body: string;
  image: string;
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
}

interface ApiStoreCollection {
  id: string;
  slug: string;
  title: string;
  routeName: string;
  routeSlug: string;
  image: string;
  body: string;
  productCount?: number;
}

interface ApiStoreProduct {
  id: string;
  slug: string;
  name: string;
  collectionId: string | null;
  collection?: ApiStoreCollection | null;
  price: number;
  currency: string;
  tag: string;
  image: string;
  story: string;
  material: string | null;
  dimensions: string | null;
  origin: string | null;
  care: string | null;
  gallery: string[];
  stock: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// ───────────── Mappers ─────────────

function mapRoute(apiRoute: ApiStoryRoute): StoryRoute {
  return {
    slug: apiRoute.slug,
    title: apiRoute.title,
    culture: apiRoute.cultureTag as StoryRoute["culture"],
    city: apiRoute.cityName,
    citySlugs: [
      ...(apiRoute.routeCityLinks?.map((l) => l.citySlug) ?? []),
      apiRoute.cityName.toLowerCase(),
    ],
    duration: apiRoute.duration,
    audience: apiRoute.audience,
    summary: apiRoute.summary,
    story: apiRoute.story,
    image: apiRoute.coverImage,
    mapViewBox: "0 0 900 600",
    itinerary: (apiRoute.stops ?? []).map((s) => ({
      time: s.time,
      stop: s.stopName,
      plan: s.plan ?? "",
      story: s.story,
      details: s.details ?? [],
      culturalStory: s.culturalStory,
      lat: s.lat ?? 0,
      lng: s.lng ?? 0,
      placeDetail: s.placeDetail,
      meal: s.meal ?? undefined,
      hotel: s.hotel ?? undefined,
      transit: s.transit ?? undefined,
      image: s.image ?? undefined,
    })),
  };
}

function mapCity(apiCity: ApiCity): CityCulture {
  return {
    slug: apiCity.slug,
    name: apiCity.name,
    adcode: apiCity.adcode ?? 0,
    label: apiCity.regionLabel,
    summary: apiCity.editorIntro ?? "",
    narrative: apiCity.heroNarrative,
    image: apiCity.heroImage,
    gallery: apiCity.galleryImages ?? [],
    tags: apiCity.tags ?? [],
    food: apiCity.foodTitle,
    routeSlugs: apiCity.routes?.map((r) => r.slug) ?? [],
    stats:
      apiCity.sections
        ?.map((s) => s.statLabel ?? "")
        .filter(Boolean) ?? [],
    quotes:
      apiCity.sections
        ?.map((s) => s.breathQuote ?? "")
        .filter(Boolean) ?? [],
    foodImages: apiCity.foodImages ?? [],
    breathImages:
      apiCity.sections
        ?.map((s) => s.breathImage ?? "")
        .filter((b): b is string => b !== null) ?? [],
    sections:
      apiCity.sections?.map((s) => ({
        title: s.title,
        body: s.body,
      })) ?? [],
  };
}

function mapProduct(apiProduct: ApiStoreProduct): StoreProduct {
  return {
    slug: apiProduct.slug,
    name: apiProduct.name,
    collection: apiProduct.collection?.title ?? "",
    price: Number(apiProduct.price),
    currency: (apiProduct.currency as StoreProduct["currency"]) ?? "SGD",
    tag: apiProduct.tag,
    image: apiProduct.image,
    story: apiProduct.story,
    details:
      apiProduct.material || apiProduct.dimensions || apiProduct.origin || apiProduct.care
        ? {
            material: apiProduct.material ?? "",
            dimensions: apiProduct.dimensions ?? "",
            origin: apiProduct.origin ?? "",
            care: apiProduct.care ?? "",
          }
        : undefined,
    gallery: apiProduct.gallery ?? undefined,
  };
}

function mapCollection(apiCol: ApiStoreCollection): StoreCollection {
  return {
    title: apiCol.title,
    route: apiCol.routeName,
    href: `/routes/${apiCol.routeSlug}`,
    image: apiCol.image,
    body: apiCol.body,
  };
}

interface ApiInterpretingMode {
  id: string;
  sortOrder: number;
  title: string;
  price: string;
  bestFor: string;
  body: string;
  includes: string[];
  accent: "light" | "dark";
  featured: boolean;
}

interface ApiInterpreterProfile {
  id: string;
  sortOrder: number;
  name: string;
  language: string;
  focus: string;
  helps: string[];
}

interface ApiInterpretingFaq {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
}

export interface InterpretingData {
  serviceModes: ApiInterpretingMode[];
  profiles: ApiInterpreterProfile[];
  faqs: ApiInterpretingFaq[];
}

// ───────────── Public API data hooks ─────────────

export async function fetchInterpreting(
  locale: Locale,
): Promise<InterpretingData> {
  const res = await apiGet<{
    service_modes: ApiInterpretingMode[];
    profiles: ApiInterpreterProfile[];
    faqs: ApiInterpretingFaq[];
  }>("/public/interpreting", {
    lang: locale,
  });
  return {
    serviceModes: res.service_modes ?? [],
    profiles: res.profiles ?? [],
    faqs: res.faqs ?? [],
  };
}

export async function fetchRoutes(locale: Locale): Promise<StoryRoute[]> {
  const res = await apiGet<PaginatedResponse<ApiStoryRoute>>("/public/routes", {
    page: 1,
    limit: 50,
    lang: locale,
  });
  return res.data.map(mapRoute);
}

export async function fetchRouteBySlug(
  slug: string,
  locale: Locale,
): Promise<StoryRoute | null> {
  try {
    const res = await apiGet<ApiStoryRoute>(`/public/routes/${slug}`, {
      lang: locale,
    });
    return mapRoute(res);
  } catch {
    return null;
  }
}

export async function fetchCities(locale: Locale): Promise<CityCulture[]> {
  const res = await apiGet<PaginatedResponse<ApiCity>>("/public/cities", {
    page: 1,
    limit: 50,
    lang: locale,
  });
  return res.data.map(mapCity);
}

export async function fetchCityBySlug(
  slug: string,
  locale: Locale,
): Promise<CityCulture | null> {
  try {
    const res = await apiGet<ApiCity>(`/public/cities/${slug}`, {
      lang: locale,
    });
    return mapCity(res);
  } catch {
    return null;
  }
}

export async function fetchStoreCollections(
  locale: Locale,
): Promise<StoreCollection[]> {
  const res = await apiGet<{ collections: ApiStoreCollection[] }>("/public/shop/collections", {
    lang: locale,
  });
  return (res.collections ?? []).map(mapCollection);
}

export async function fetchStoreProducts(
  locale: Locale,
  collectionSlug?: string,
): Promise<StoreProduct[]> {
  const params: Record<string, string | number | undefined> = {
    page: 1,
    limit: 50,
    lang: locale,
  };
  if (collectionSlug) params.collection = collectionSlug;
  const res = await apiGet<{ products: ApiStoreProduct[] }>(
    "/public/shop/products",
    params,
  );
  return (res.products ?? []).map(mapProduct);
}

export async function fetchStoreProductBySlug(
  slug: string,
  locale: Locale,
): Promise<StoreProduct | null> {
  try {
    const res = await apiGet<{ product: ApiStoreProduct }>(
      `/public/shop/products/${slug}`,
      { lang: locale },
    );
    return res.product ? mapProduct(res.product) : null;
  } catch {
    return null;
  }
}

export async function fetchRelatedProducts(
  product: StoreProduct,
  allProducts: StoreProduct[],
): Promise<StoreProduct[]> {
  const getCollectionTitle = (p: StoreProduct) => 
    typeof p.collection === 'string' ? p.collection : (p.collection as any)?.title;
  
  const targetTitle = getCollectionTitle(product);
  
  return allProducts.filter(
    (p) => p.slug !== product.slug && getCollectionTitle(p) === targetTitle,
  );
}

// ───────────── Home page data ─────────────

export interface HomeData {
  regionShowcase: Region[];
  featuredRoutes: FeaturedRoute[];
  cultureHighlights: CultureFeature[];
  testimonials: Testimonial[];
  trustMetrics: TrustMetric[];
  homeEntryCards: HomeEntryCard[];
}

export async function fetchHomeData(locale: Locale): Promise<HomeData> {
  // Home data is mostly editorial — we fetch routes + cities for counts
  const [routes, cities] = await Promise.all([
    fetchRoutes(locale),
    fetchCities(locale),
  ]);

  const featured = routes[0];
  const firstCity = cities[0];

  const regionShowcase: Region[] = cities.map((c) => ({
    slug: c.slug as RegionSlug,
    adcode: c.adcode,
    name: c.name,
    label: c.label,
    summary: c.summary,
    narrative: c.narrative,
    tags: c.tags,
    food: c.food,
    routeSlugs: c.routeSlugs,
    serviceLabel: locale === "zh" ? `预约${c.name}口译` : `Book ${c.name} Support`,
    serviceHref: "/interpreting",
    image: c.image,
    gallery: c.gallery,
  }));

  const featuredRoutes: FeaturedRoute[] = featured
    ? [
        {
          slug: featured.slug,
          title: featured.title,
          theme: featured.culture,
          duration: featured.duration,
          audience: featured.audience,
          description: featured.summary,
        },
      ]
    : [];

  const cultureHighlights: CultureFeature[] = cities.map((city) => ({
    slug: city.slug,
    title: city.label,
    body: city.summary,
    href: `/culture/${city.slug}`,
  }));

  return {
    regionShowcase,
    featuredRoutes,
    cultureHighlights,
    testimonials: [], // Editorial content stays in translations
    trustMetrics: [
      { value: String(cities.length || 1), label: locale === "zh" ? "座精选城市" : "Featured city" },
      { value: String(routes.length || 1), label: locale === "zh" ? "条故事路线" : "Story route" },
      { value: "1", label: locale === "zh" ? "个文化系列" : "Cultural collection" },
    ],
    homeEntryCards: [
      {
        id: "01",
        title: locale === "zh" ? "文化" : "Culture",
        body: locale === "zh"
          ? "阅读城市故事，了解每片目的地背后的美食、手工艺与日常生活。"
          : "Read city stories that explain the food, craft, and daily life behind each destination.",
        href: "/culture",
      },
      {
        id: "02",
        title: locale === "zh" ? "故事路线" : "Story Routes",
        body: locale === "zh"
          ? "跟随围绕一个主题打造的路线——一个市场、一段海岸线、一门手艺。"
          : "Follow a route built around a single idea — a market, a coastline, a craft tradition.",
        href: "/routes",
      },
      {
        id: "03",
        title: locale === "zh" ? "口译服务" : "Interpreter Service",
        body: locale === "zh"
          ? "预约英语本地支持：交通、菜单、购票、文化背景。"
          : "Book English-speaking local support for the day: transport, menus, tickets, and cultural context.",
        href: "/interpreting",
      },
      {
        id: "04",
        title: locale === "zh" ? "文创商城" : "Lingnan Store",
        body: locale === "zh"
          ? "带回家与路线息息相关的好物——陶瓷、织物、有故事的小物件。"
          : "Take home objects tied to the routes — ceramics, textiles, and objects with a story.",
        href: "/shop",
      },
    ],
  };
}

// Re-export useApiQuery for convenience
export { useApiQuery, type AsyncState } from "./use-api-query";
