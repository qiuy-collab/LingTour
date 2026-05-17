/**
 * API Data Module
 *
 * Bridges backend API responses 鈫?frontend TypeScript types.
 * Each function:
 *  1. Calls the backend via apiClient
 *  2. Maps the response shape to the consumer type expected
 *  3. Returns a clean result (or throws on failure)
 *
 * Locale is passed via Accept鈥揕anguage header (handled by apiClient).
 */

import { apiGet, apiPost } from "./api-client";
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

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Internal API response types 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

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
  relatedCitySlugs?: string[];
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
  slug: string;
  price: number;
  currency: string;
  image: string;
  gallery: string[];
  collection: {
    slug: string;
    title: string;
  } | null;
  product: {
    name: string;
    tag: string;
  };
  materialNotes: string | null;
  story: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

type LocalizedText = string | { en?: string; zh?: string };

interface ApiHomeConfig {
  trustMetrics?: Array<{ value: string; label: LocalizedText }>;
  entryCards?: Array<{ id: string; title: LocalizedText; body: LocalizedText; href: string }>;
  cultureHighlights?: Array<{ slug: string; title: LocalizedText; body: LocalizedText; href?: string }>;
  testimonials?: Array<{ quote: LocalizedText; name: LocalizedText }>;
  featuredRouteSlugs?: string[];
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Mappers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

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
    foodDescription: apiCity.foodDescription ?? "",
    routeSlugs: apiCity.routes?.map((r) => r.slug) ?? [],
    relatedCitySlugs: apiCity.relatedCitySlugs ?? [],
    foodImages: apiCity.foodImages ?? [],
    sections:
      apiCity.sections?.map((s) => ({
        title: s.title,
        body: s.body,
        image: s.image,
        stat: [s.statLabel, s.statValue].filter(Boolean).join(" / ") || undefined,
        breathImage: s.breathImage ?? undefined,
        breathQuote: s.breathQuote ?? undefined,
      })) ?? [],
  };
}

function mapProduct(apiProduct: ApiStoreProduct): StoreProduct {
  return {
    slug: apiProduct.slug,
    name: apiProduct.product.name,
    collection: apiProduct.collection?.title ?? "",
    price: Number(apiProduct.price),
    currency: (apiProduct.currency as StoreProduct["currency"]) ?? "SGD",
    tag: apiProduct.product.tag,
    image: apiProduct.image,
    materialNotes: apiProduct.materialNotes ?? undefined,
    story: apiProduct.story,
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

function pickLocalized(value: LocalizedText | undefined, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return locale === "zh" ? (value.zh ?? value.en ?? "") : (value.en ?? value.zh ?? "");
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

export type InterpretingBookingPayload = {
  name: string;
  contact: string;
  city: string;
  serviceDate: string;
  supportMode: string;
  groupSize?: string;
  routeOrNeed?: string;
  fastTrack?: boolean;
};

export type InterpretingDepositCheckout = {
  bookingId: string;
  created_at: string;
  status: string;
  message: string;
  deposit: {
    orderNo: string;
    amount: number;
    currency: string;
    status: string;
    paymentLabel: string;
    stripeClientSecret: string;
  };
};

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Public API data hooks 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

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

export async function createInterpretingDepositCheckout(
  payload: InterpretingBookingPayload,
): Promise<InterpretingDepositCheckout> {
  return apiPost<InterpretingDepositCheckout>("/public/bookings/checkout", payload);
}

export async function confirmInterpretingDeposit(
  bookingId: string,
  orderNo: string,
  paymentId: string,
): Promise<{
  bookingId: string;
  bookingStatus: string;
  orderNo: string;
  paymentId: string;
  message: string;
}> {
  return apiPost(`/public/bookings/${bookingId}/confirm-deposit`, {
    orderNo,
    paymentId,
  });
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

export interface HomeData {
  regionShowcase: Region[];
  featuredRoutes: FeaturedRoute[];
  cultureHighlights: CultureFeature[];
  testimonials: Testimonial[];
  trustMetrics: TrustMetric[];
  homeEntryCards: HomeEntryCard[];
}

export async function fetchHomeData(locale: Locale): Promise<HomeData> {
  const [routes, cities, homeConfig] = await Promise.all([
    fetchRoutes(locale),
    fetchCities(locale),
    apiGet<ApiHomeConfig>("/public/home", { lang: locale }).catch(
      () => ({}) as ApiHomeConfig,
    ),
  ]);

  const featured =
    routes.find((r) => homeConfig.featuredRouteSlugs?.includes(r.slug)) ?? routes[0];

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
    ? [{
        slug: featured.slug,
        title: featured.title,
        theme: featured.culture,
        duration: featured.duration,
        audience: featured.audience,
        description: featured.summary,
      }]
    : [];

  const cultureHighlightsFromApi = (homeConfig.cultureHighlights ?? []).map((item) => ({
    slug: item.slug,
    title: pickLocalized(item.title, locale),
    body: pickLocalized(item.body, locale),
    href: item.href ?? `/culture/${item.slug}`,
  }));

  const cultureHighlights: CultureFeature[] =
    cultureHighlightsFromApi.length > 0
      ? cultureHighlightsFromApi
      : cities.map((city) => ({
          slug: city.slug,
          title: city.label,
          body: city.summary,
          href: `/culture/${city.slug}`,
        }));

  return {
    regionShowcase,
    featuredRoutes,
    cultureHighlights,
    testimonials: (homeConfig.testimonials ?? []).map((item) => ({
      quote: pickLocalized(item.quote, locale),
      name: pickLocalized(item.name, locale),
    })),
    trustMetrics:
      homeConfig.trustMetrics?.map((item) => ({
        value: item.value,
        label: pickLocalized(item.label, locale),
      })) ?? [
        { value: String(cities.length || 1), label: locale === "zh" ? "精选城市" : "Featured city" },
        { value: String(routes.length || 1), label: locale === "zh" ? "故事路线" : "Story route" },
        { value: "1", label: locale === "zh" ? "文化商品系列" : "Cultural collection" },
      ],
    homeEntryCards:
      homeConfig.entryCards?.map((item) => ({
        id: item.id,
        title: pickLocalized(item.title, locale),
        body: pickLocalized(item.body, locale),
        href: item.href,
      })) ?? [],
  };
}

// Re-export useApiQuery for convenience
export { useApiQuery, type AsyncState } from "./use-api-query";

