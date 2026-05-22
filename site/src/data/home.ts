/**
 * Type-only module: shape definitions for the home page editorial blocks.
 *
 * The hardcoded fixtures that used to live here have been removed. The home
 * page now consumes everything via `fetchHomeData` (see `lib/api-data`).
 *
 * Re-exports types from `@/types/content` for callers that historically
 * imported them via `@/data/home`.
 */

export type {
  CultureFeature,
  FeaturedRoute,
  HomeEntryCard,
  HomeHeroStat,
  Region,
  ServiceStep,
  Testimonial,
  TrustMetric,
} from "@/types/content";
