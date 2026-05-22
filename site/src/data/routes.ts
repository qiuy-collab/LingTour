/**
 * Type-only module: shape definition for story routes.
 *
 * The hardcoded fixtures and helper functions (storyRoutes, getStoryRoute,
 * geoToSVG) that used to live here have been removed. Routes are now
 * sourced from the backend via `lib/api-data` (`fetchRoutes`, `fetchRouteBySlug`).
 *
 * Pages and components keep importing the type only.
 */

export type StoryRoute = {
  slug: string;
  title: string;
  culture:
    | "Guangfu"
    | "Chaoshan"
    | "Hakka"
    | "Coastal"
    | "Bay Area"
    | "Mountain";
  city: string;
  citySlugs: string[];
  duration: string;
  audience: string;
  summary: string;
  story: string;
  image: string;
  /** SVG viewBox for the route map (kept for component layout, not data). */
  mapViewBox: string;
  itinerary: {
    time: string;
    stop: string;
    plan: string;
    story: string;
    details: string[];
    culturalStory: string;
    /** Geographic coordinate (latitude). */
    lat: number;
    /** Geographic coordinate (longitude). */
    lng: number;
    placeDetail?: string;
    meal?: string;
    hotel?: string;
    transit?: string;
    image?: string;
    images?: string[];
  }[];
};
