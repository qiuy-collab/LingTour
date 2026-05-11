/**
 * Locale-aware data helper.
 * Pages import from here instead of directly from @/data/* to get localized content.
 */
import type { Locale } from "@/lib/locale";
import type {
  Region,
  FeaturedRoute,
  CultureFeature,
  Testimonial,
  TrustMetric,
  HomeEntryCard,
} from "@/types/content";
import type { CityCulture } from "@/data/culture";
import type { StoryRoute } from "@/data/routes";
import type { StoreCollection, StoreProduct } from "@/data/store";

// ── English data ──
import {
  regionShowcase as enRegionShowcase,
  featuredRoutes as enFeaturedRoutes,
  cultureHighlights as enCultureHighlights,
  testimonials as enTestimonials,
  trustMetrics as enTrustMetrics,
  homeEntryCards as enHomeEntryCards,
} from "./home";

import { storyRoutes as enStoryRoutes } from "./routes";
import { cityCultures as enCityCultures } from "./culture";
import { storeCollections as enStoreCollections, storeProducts as enStoreProducts } from "./store";

// ── Chinese data ──
import { zhRegionShowcase, zhFeaturedRoutes, zhCultureHighlights, zhTestimonials, zhTrustMetrics, zhHomeEntryCards } from "./zh/home";
import { zhStoryRoutes } from "./zh/routes";
import { zhCityCultures } from "./zh/culture";
import { zhStoreCollections, zhStoreProducts } from "./zh/store";

interface HomeData {
  regionShowcase: Region[];
  featuredRoutes: FeaturedRoute[];
  cultureHighlights: CultureFeature[];
  testimonials: Testimonial[];
  trustMetrics: TrustMetric[];
  homeEntryCards: HomeEntryCard[];
}

interface RoutesData {
  storyRoutes: StoryRoute[];
}

interface CultureData {
  cityCultures: CityCulture[];
}

interface StoreData {
  storeCollections: StoreCollection[];
  storeProducts: StoreProduct[];
}

/** Get home page data in the requested locale */
export function getHomeData(locale: Locale): HomeData {
  if (locale === "zh") {
    return {
      regionShowcase: zhRegionShowcase,
      featuredRoutes: zhFeaturedRoutes,
      cultureHighlights: zhCultureHighlights,
      testimonials: zhTestimonials,
      trustMetrics: zhTrustMetrics,
      homeEntryCards: zhHomeEntryCards,
    };
  }
  return {
    regionShowcase: enRegionShowcase,
    featuredRoutes: enFeaturedRoutes,
    cultureHighlights: enCultureHighlights,
    testimonials: enTestimonials,
    trustMetrics: enTrustMetrics,
    homeEntryCards: enHomeEntryCards,
  };
}

/** Get routes data in the requested locale */
export function getRoutesData(locale: Locale): RoutesData {
  return {
    storyRoutes: locale === "zh" ? zhStoryRoutes : enStoryRoutes,
  };
}

/** Get culture data in the requested locale */
export function getCultureData(locale: Locale): CultureData {
  return {
    cityCultures: locale === "zh" ? zhCityCultures : enCityCultures,
  };
}

/** Get store data in the requested locale */
export function getStoreData(locale: Locale): StoreData {
  if (locale === "zh") {
    return {
      storeCollections: zhStoreCollections,
      storeProducts: zhStoreProducts,
    };
  }
  return {
    storeCollections: enStoreCollections,
    storeProducts: enStoreProducts,
  };
}

/** Resolve a city's culture detail by slug */
export function getCityBySlug(slug: string, locale: Locale): CityCulture | undefined {
  const pool = locale === "zh" ? zhCityCultures : enCityCultures;
  return pool.find((c) => c.slug === slug);
}

/** Resolve a route by slug */
export function getRouteBySlug(slug: string, locale: Locale): StoryRoute | undefined {
  const pool = locale === "zh" ? zhStoryRoutes : enStoryRoutes;
  return pool.find((r) => r.slug === slug);
}
