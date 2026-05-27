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
  HomeHero,
} from "@/types/content";
import type { CityCulture } from "@/data/culture";
import type { StoryRoute } from "@/data/routes";
import type { StoreCollection, StoreProduct } from "@/data/store";
import { SEED_IMAGES } from "@/lib/seed-images";
import {
  DEFAULT_ROUTE_REGIONS,
  pickRouteRegionText,
  type RouteRegion,
} from "@/lib/route-regions";

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
  id: string;
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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
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
  };
  trustMetrics?: Array<{ value: string; label: LocalizedText }>;
  entryCards?: Array<{
    id: string;
    title: LocalizedText;
    body: LocalizedText;
    href: string;
  }>;
  cultureHighlights?: Array<{
    slug: string;
    title: LocalizedText;
    body: LocalizedText;
    href?: string;
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

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Mappers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function mapRoute(apiRoute: ApiStoryRoute): StoryRoute {
  const southernSeaTableStopImages =
    apiRoute.slug === "southern-sea-table"
      ? [
          [SEED_IMAGES.routeHuguangyan, SEED_IMAGES.routeVolcanicLandscape1200, SEED_IMAGES.routeVolcanicLandscape800],
          [SEED_IMAGES.routeDongfeng, SEED_IMAGES.routeSeafoodDishes800, SEED_IMAGES.routeSouthernCoast1200],
          [SEED_IMAGES.routeXiashan, SEED_IMAGES.routeSouthernCoast1400, SEED_IMAGES.routeSouthernCoast1200],
          [SEED_IMAGES.routeJinsha, SEED_IMAGES.routeSouthernCoast1400, SEED_IMAGES.routeSeafoodDishes800],
        ]
      : [];

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
    routeRegionKey: apiRoute.routeRegionKey ?? undefined,
    mapViewBox: "0 0 900 600",
    itinerary: (apiRoute.stops ?? []).map((s, index) => {
      const fallbackImages = southernSeaTableStopImages[index] ?? [];
      const images = [
        ...(s.images ?? []),
        s.image,
        ...fallbackImages,
      ].filter((frame): frame is string => Boolean(frame?.trim()));
      const uniqueImages = Array.from(new Set(images)).slice(0, 3);

      return {
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
        image: uniqueImages[0] ?? s.image,
        images: uniqueImages.length > 1 ? uniqueImages : undefined,
      };
    }),
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
        stat:
          [s.statLabel, s.statValue].filter(Boolean).join(" / ") || undefined,
        breathImage: s.breathImage ?? undefined,
        breathQuote: s.breathQuote ?? undefined,
      })) ?? [],
  };
}

function mapProduct(apiProduct: ApiStoreProduct): StoreProduct {
  return {
    id: apiProduct.id,
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

export type EventData = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string;
  citySlug: string;
  tags: string[];
  summary: string;
  description: string;
  relatedRouteSlugs: string[];
  image: string;
};

function mapEvent(apiEvent: ApiEvent, locale: Locale): EventData {
  return {
    id: apiEvent.id,
    slug: apiEvent.slug,
    title: pickLocalized(apiEvent.title, locale),
    date: apiEvent.date,
    city: apiEvent.city,
    citySlug: apiEvent.citySlug,
    tags: apiEvent.tags ?? [],
    summary: pickLocalized(apiEvent.summary, locale),
    description: pickLocalized(apiEvent.description, locale),
    relatedRouteSlugs: apiEvent.relatedRouteSlugs ?? [],
    image: apiEvent.image ?? "",
  };
}

function pickLocalized(
  value: LocalizedText | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return locale === "zh"
    ? (value.zh ?? value.en ?? "")
    : (value.en ?? value.zh ?? "");
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
  return apiPost<InterpretingDepositCheckout>(
    "/public/bookings/checkout",
    payload,
  );
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
  const res = await apiGet<{ collections: ApiStoreCollection[] }>(
    "/public/shop/collections",
    {
      lang: locale,
    },
  );
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

export async function fetchEvents(locale: Locale): Promise<EventData[]> {
  const res = await apiGet<{ items: ApiEvent[] }>("/public/events", {
    page: 1,
    limit: 50,
  });
  return (res.items ?? []).map((item) => mapEvent(item, locale));
}

export async function fetchEventBySlug(
  slug: string,
  locale: Locale,
): Promise<EventData | null> {
  try {
    const res = await apiGet<ApiEvent>(`/public/events/${slug}`);
    return mapEvent(res, locale);
  } catch {
    return null;
  }
}

export async function fetchRelatedProducts(
  product: StoreProduct,
  allProducts: StoreProduct[],
): Promise<StoreProduct[]> {
  const getCollectionTitle = (p: StoreProduct) => p.collection ?? "";

  const targetTitle = getCollectionTitle(product);
  return allProducts.filter(
    (p) => p.slug !== product.slug && getCollectionTitle(p) === targetTitle,
  );
}

export interface HomeData {
  hero: HomeHero;
  regionShowcase: Region[];
  featuredRoutes: FeaturedRoute[];
  cultureHighlights: CultureFeature[];
  testimonials: Testimonial[];
  trustMetrics: TrustMetric[];
  homeEntryCards: HomeEntryCard[];
  routeRegions: RouteRegion[];
}

export async function fetchRouteRegions(locale: Locale): Promise<RouteRegion[]> {
  try {
    const homeConfig = await apiGet<ApiHomeConfig>("/public/home", { rawI18n: "true" });
    if (!homeConfig.routeRegions?.length) return DEFAULT_ROUTE_REGIONS;
    return homeConfig.routeRegions.map((region) => ({
      key: region.key,
      title: {
        zh: pickRouteRegionText(region.title, "zh"),
        en: pickRouteRegionText(region.title, "en"),
      },
      note: {
        zh: pickRouteRegionText(region.note, "zh"),
        en: pickRouteRegionText(region.note, "en"),
      },
      adcodes: Array.isArray(region.adcodes) ? region.adcodes : [],
    }));
  } catch {
    return DEFAULT_ROUTE_REGIONS;
  }
}

export async function fetchHomeData(locale: Locale): Promise<HomeData> {
  const [routesResult, citiesResult, homeConfigResult] =
    await Promise.allSettled([
      fetchRoutes(locale),
      fetchCities(locale),
      apiGet<ApiHomeConfig>("/public/home", { rawI18n: "true" }),
    ]);

  const routes = routesResult.status === "fulfilled" ? routesResult.value : [];
  const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
  const homeConfig =
    homeConfigResult.status === "fulfilled"
      ? homeConfigResult.value
      : ({} as ApiHomeConfig);

  const featured =
    routes.find((r) => homeConfig.featuredRouteSlugs?.includes(r.slug)) ??
    routes[0];

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
    serviceLabel:
      locale === "zh" ? `预约${c.name}口译` : `Book ${c.name} Support`,
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

  const cultureHighlightsFromApi = (homeConfig.cultureHighlights ?? []).map(
    (item) => ({
      slug: item.slug,
      title: pickLocalized(item.title, locale),
      body: pickLocalized(item.body, locale),
      href: item.href ?? `/culture/${item.slug}`,
    }),
  );

  const cultureHighlights: CultureFeature[] =
    cultureHighlightsFromApi.length > 0
      ? cultureHighlightsFromApi
      : cities.map((city) => ({
          slug: city.slug,
          title: city.label,
          body: city.summary,
          href: `/culture/${city.slug}`,
        }));

  // Map the editorial hero block. All fields fall through to undefined,
  // letting the page render Journal placeholders cleanly.
  const heroSrc = homeConfig.hero ?? {};
  const hero: HomeHero = {
    image: heroSrc.image || undefined,
    caption: heroSrc.caption ? pickLocalized(heroSrc.caption, locale) : undefined,
    ctaImage: heroSrc.ctaImage || undefined,
    interpretingImage: heroSrc.interpretingImage || undefined,
    interpretingLabel: heroSrc.interpretingLabel
      ? pickLocalized(heroSrc.interpretingLabel, locale)
      : undefined,
    badge: heroSrc.badge
      ? {
          value: heroSrc.badge.value ?? "",
          label: heroSrc.badge.label
            ? pickLocalized(heroSrc.badge.label, locale)
            : "",
        }
      : undefined,
  };

  const routeRegions =
    homeConfig.routeRegions?.length
      ? homeConfig.routeRegions.map((region) => ({
          key: region.key,
          title: {
            zh: pickRouteRegionText(region.title, "zh"),
            en: pickRouteRegionText(region.title, "en"),
          },
          note: {
            zh: pickRouteRegionText(region.note, "zh"),
            en: pickRouteRegionText(region.note, "en"),
          },
          adcodes: Array.isArray(region.adcodes) ? region.adcodes : [],
        }))
      : DEFAULT_ROUTE_REGIONS;

  return {
    hero,
    regionShowcase,
    featuredRoutes,
    cultureHighlights,
    testimonials: (homeConfig.testimonials ?? []).map((item) => ({
      quote: pickLocalized(item.quote, locale),
      name: pickLocalized(item.name, locale),
    })),
    trustMetrics: homeConfig.trustMetrics?.map((item) => ({
      value: item.value,
      label: pickLocalized(item.label, locale),
    })) ?? [
      {
        value: String(cities.length || 1),
        label: locale === "zh" ? "精选城市" : "Featured city",
      },
      {
        value: String(routes.length || 1),
        label: locale === "zh" ? "故事路线" : "Story route",
      },
      {
        value: "1",
        label: locale === "zh" ? "文化商品系列" : "Cultural collection",
      },
    ],
    homeEntryCards:
      homeConfig.entryCards?.map((item) => ({
        id: item.id,
        title: pickLocalized(item.title, locale),
        body: pickLocalized(item.body, locale),
        href: item.href,
      })) ?? [],
    routeRegions,
  };
}

// Re-export useApiQuery for convenience
export { useApiQuery, type AsyncState } from "./use-api-query";

// ───────────────── Community posts (route detail page) ─────────────────

export type CommunityFeedPost = {
  id: string;
  title: string;
  excerpt: string;
  channel: string;
  user: { name: string; handle?: string; avatar?: string };
  image: string;
  location: string;
  route: string;
  createdAt: string;
  date: string;
  readTime: string;
  mood: string;
  tags: string[];
  likes: number;
  comments: number;
  saves: number;
  liked?: boolean;
  saved?: boolean;
  prompt: string;
  status: string;
};

export type RouteCommunityPost = Omit<
  CommunityFeedPost,
  "date" | "readTime" | "likes" | "comments" | "saves" | "prompt"
>;

interface ApiCommunityPost {
  id: string;
  channel: string;
  status: string;
  user: Record<string, unknown>;
  title: { en: string; zh: string } | string;
  excerpt: { en: string; zh: string } | string;
  tags?: string[];
  image: string | null;
  location: string;
  route: string;
  mood: string;
  likes?: number;
  comments?: number;
  saves?: number;
  liked?: boolean;
  saved?: boolean;
  createdAt: string;
}

function pickLocaleString(
  value: { en: string; zh: string } | string,
  locale: Locale,
): string {
  if (typeof value === "string") return value;
  return locale === "zh"
    ? (value.zh ?? value.en ?? "")
    : (value.en ?? value.zh ?? "");
}

function formatPostDate(createdAt: string, locale: Locale): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeCommunityChannel(channel: string): string {
  const normalized = channel.trim().toLowerCase();
  if (normalized === "field-notes") return "Field Notes";
  if (normalized === "food-map") return "Food Map";
  if (normalized === "hidden-stop") return "Hidden Stop";
  if (normalized === "culture-desk") return "Culture Desk";
  return channel;
}

function mapCommunityPost(
  api: ApiCommunityPost,
  locale: Locale,
): CommunityFeedPost {
  const userObj = (api.user ?? {}) as Record<string, unknown>;
  const location = api.location ?? "";
  const route = api.route ?? "";
  const tags = api.tags ?? [];
  return {
    id: api.id,
    title: pickLocaleString(api.title, locale),
    excerpt: pickLocaleString(api.excerpt, locale),
    channel: normalizeCommunityChannel(api.channel),
    user: {
      name: typeof userObj.name === "string" ? userObj.name : "Field Agent",
      handle: typeof userObj.handle === "string" ? userObj.handle : undefined,
      avatar: typeof userObj.avatar === "string" ? userObj.avatar : undefined,
    },
    image: api.image ?? "",
    location,
    route,
    createdAt: api.createdAt,
    date: formatPostDate(api.createdAt, locale),
    readTime: "1 min",
    mood: api.mood ?? "",
    tags,
    likes: api.likes ?? 0,
    comments: api.comments ?? 0,
    saves: api.saves ?? 0,
    liked: api.liked ?? false,
    saved: api.saved ?? false,
    prompt:
      tags.length > 0
        ? `Track: ${tags.join(" · ")}`
        : `Filed from ${location || route || "Guangdong"}.`,
    status: api.status,
  };
}

/**
 * Fetch community posts attached to a route. The backend `route` field is
 * a free-form string (the route title). We fetch a generous page and filter
 * client-side because the API has no native route-slug filter.
 */
export async function fetchRouteCommunityPosts(
  options: {
    routeSlug: string;
    routeTitle?: string;
    stopName?: string;
    locale: Locale;
  },
): Promise<RouteCommunityPost[]> {
  const { routeSlug, routeTitle, stopName, locale } = options;
  try {
    const res = await apiGet<{ items: ApiCommunityPost[] }>(
      "/public/community/posts",
      {
        route: routeSlug,
        location: stopName,
        limit: 50,
      },
    );
    const routeTargets = [routeSlug, routeTitle].filter(Boolean).map((value) =>
      String(value).toLowerCase().trim(),
    );
    const stopTarget = stopName?.toLowerCase().trim();

    return (res.items ?? [])
      .map((p) => mapCommunityPost(p, locale))
      .filter((p) => {
        const route = p.route.toLowerCase().trim();
        const location = p.location.toLowerCase().trim();
        const routeMatches = routeTargets.length === 0 || routeTargets.includes(route);
        const stopMatches = !stopTarget || location === stopTarget;
        return routeMatches && stopMatches;
      })
      .map(({ date: _date, readTime: _readTime, likes: _likes, comments: _comments, saves: _saves, prompt: _prompt, ...post }) => {
        void _date;
        void _readTime;
        void _likes;
        void _comments;
        void _saves;
        void _prompt;
        return post;
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}

export type CreateCommunityPostInput = {
  body: string;
  routeSlug: string;
  routeTitle: string;
  routeCity: string;
  stop?: { index: number; time: string; name: string } | null;
  user: {
    id?: string;
    email?: string;
    name: string;
    handle?: string;
    avatar?: string;
  };
};

/**
 * Create a community post tied to the current route. Backend forces
 * `status: pending_review` for public posts, so the new post will not
 * immediately show up in fetchRouteCommunityPosts — the caller should
 * insert the response optimistically into its local state.
 */
export async function createCommunityPost(
  input: CreateCommunityPostInput,
): Promise<RouteCommunityPost> {
  // Trim and split the body into a short title (first sentence/line, max 80)
  // and an excerpt (the rest, capped at 280). Both fields are required by the API.
  const trimmed = input.body.trim();
  const firstLineEnd = trimmed.search(/[\n\.\!\?。！？]/);
  const titleSrc =
    firstLineEnd > 0 ? trimmed.slice(0, firstLineEnd).trim() : trimmed;
  const title =
    titleSrc.length > 80
      ? `${titleSrc.slice(0, 77)}...`
      : titleSrc || "Field Note";
  const excerpt =
    trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed;

  const payload = {
    channel: "Field Notes",
    user: input.user as Record<string, unknown>,
    userId: input.user.id,
    userEmail: input.user.email,
    title: { en: title, zh: title },
    excerpt: { en: excerpt, zh: excerpt },
    location: input.stop?.name ?? input.routeCity,
    route: input.routeSlug,
    mood: input.stop
      ? `${input.stop.time} · Stop ${input.stop.index + 1}`
      : "route field note",
    tags: [
      "field-note",
      `route:${input.routeSlug}`,
      input.stop ? `stop-index:${input.stop.index}` : null,
      input.stop ? `stop:${input.stop.name}` : null,
    ].filter((tag): tag is string => Boolean(tag)),
  };

  const created = await apiPost<ApiCommunityPost>(
    "/public/community/posts",
    payload,
  );
  const {
    date: _date,
    readTime: _readTime,
    likes: _likes,
    comments: _comments,
    saves: _saves,
    prompt: _prompt,
    ...post
  } =
    mapCommunityPost(created, "en");
  void _date;
  void _readTime;
  void _likes;
  void _comments;
  void _saves;
  void _prompt;
  return post;
}

export async function fetchCommunityFeed(
  locale: Locale,
  options?: { channel?: string; q?: string; limit?: number },
): Promise<CommunityFeedPost[]> {
  const res = await apiGet<{ items: ApiCommunityPost[] }>(
    "/public/community/posts",
    {
      channel:
        options?.channel && options.channel !== "All"
          ? options.channel
          : undefined,
      q: options?.q?.trim() || undefined,
      limit: options?.limit ?? 50,
    },
  );
  return (res.items ?? []).map((item) => mapCommunityPost(item, locale));
}

export type CommunityReactionSummary = {
  likedPostIds: string[];
  savedPostIds: string[];
};

export async function fetchCommunityReactionSummary(): Promise<CommunityReactionSummary> {
  return apiGet<CommunityReactionSummary>("/public/community/me/reactions");
}

export async function fetchSavedCommunityPosts(
  locale: Locale,
  limit = 12,
): Promise<CommunityFeedPost[]> {
  const posts = await apiGet<ApiCommunityPost[]>("/public/community/me/saves", {
    limit,
  });
  return posts.map((post) => mapCommunityPost(post, locale));
}

export async function toggleCommunityPostLike(postId: string) {
  return apiPost<{ liked: boolean; likes: number }>(
    `/public/community/posts/${postId}/like`,
  );
}

export async function toggleCommunityPostSave(postId: string) {
  return apiPost<{ saved: boolean; saves: number }>(
    `/public/community/posts/${postId}/save`,
  );
}

export type CreateCommunityFeedInput = {
  title: string;
  note: string;
  route: string;
  location: string;
  mood: string;
  channel: string;
  image?: string;
  user: {
    id?: string;
    email?: string;
    name: string;
    handle?: string;
    avatar?: string;
  };
};

export async function createCommunityFeedPost(
  input: CreateCommunityFeedInput,
  locale: Locale,
): Promise<CommunityFeedPost> {
  const safeTitle =
    input.title.trim() ||
    input.note.trim().split(/[\n.!?]/)[0]?.trim() ||
    `${input.channel} signal`;
  const safeExcerpt =
    input.note.trim() ||
    (input.image ? "Shared as a visual signal from the field." : safeTitle);

  const payload = {
    channel: input.channel,
    user: input.user as Record<string, unknown>,
    userId: input.user.id,
    userEmail: input.user.email,
    title: { en: safeTitle, zh: safeTitle },
    excerpt: { en: safeExcerpt, zh: safeExcerpt },
    location: input.location,
    route: input.route,
    mood: input.mood,
    tags: [input.channel, input.location, input.route].filter(Boolean),
    image: input.image ?? null,
  };

  const created = await apiPost<ApiCommunityPost>(
    "/public/community/posts",
    payload,
  );
  return mapCommunityPost(created, locale);
}

// ───────────────── Field Briefs (community brief tasks) ─────────────────

interface ApiCommunityBrief {
  id: string;
  slug: string;
  title: { en: string; zh: string };
  prompt: { en: string; zh: string };
  channel: string;
  location: string;
  route: string;
  mood: string;
  sortOrder: number;
  active: boolean;
}

export type FieldBrief = {
  id: string;
  slug: string;
  title: string;
  prompt: string;
  channel: string;
  location: string;
  route: string;
  mood: string;
};

function mapBrief(api: ApiCommunityBrief, locale: Locale): FieldBrief {
  return {
    id: api.id,
    slug: api.slug,
    title: pickLocaleString(api.title, locale),
    prompt: pickLocaleString(api.prompt, locale),
    channel: api.channel || "Field Notes",
    location: api.location || "",
    route: api.route || "",
    mood: api.mood || "",
  };
}

/**
 * Fetch the editorial field briefs the community page surfaces as prompts.
 * Backend returns them already filtered by `active = true` and sorted by
 * `sortOrder`. If the request fails, callers get an empty array — the page
 * falls through to a neutral empty state.
 */
export async function fetchCommunityBriefs(
  locale: Locale,
): Promise<FieldBrief[]> {
  try {
    const res = await apiGet<ApiCommunityBrief[]>(
      "/public/community/briefs",
    );
    return (res ?? []).map((b) => mapBrief(b, locale));
  } catch {
    return [];
  }
}
