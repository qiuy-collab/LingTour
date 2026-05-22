/**
 * Real assets that already live in the backend image library
 * (api/uploads/seed/...). The frontend can reference these directly
 * via the `/uploads/...` static route the API exposes.
 *
 * These references exist so we can drop external Unsplash links *now*
 * without waiting for ops to re-upload through the admin UI. Each
 * caller should still prefer the API-driven field (e.g. `homeData.hero.image`)
 * and only fall back to one of these when the field is empty.
 *
 * When the admin UI ships and ops fills in real CMS fields, this module
 * should naturally see fewer references — anywhere it's still imported
 * from is a place to revisit.
 */

const apiBase = (() => {
  const env = process.env.NEXT_PUBLIC_API_URL ?? "";
  // Strip trailing /api/v1 so we land on the static /uploads root
  return env.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "") || "";
})();

function uploaded(path: string): string {
  // Path on the backend's static /uploads route, e.g. "/uploads/seed/foo.jpg"
  return `${apiBase}${path}`;
}

/**
 * Curated seed images from the backend library.
 *
 * Naming reflects intended editorial use, not file path; if an image is
 * removed from the backend you only need to update this map.
 */
export const SEED_IMAGES = {
  // Wide / hero (16:9 or close)
  homeHero: uploaded("/uploads/seed/zhanjiang-hero-1400.jpg"),
  homeCta: uploaded("/uploads/seed/southern-coast-1400.jpg"),
  homeInterpreting: uploaded("/uploads/seed/pottery-workshop-1200.jpg"),

  cultureHero: uploaded("/uploads/seed/zhanjiang-hero-1200.jpg"),
  cultureCta: uploaded("/uploads/seed/volcanic-landscape-1400.jpg"),
  cultureFood: uploaded("/uploads/seed/seafood-dishes-800.jpg"),

  routesHero: uploaded("/uploads/seed/southern-coast-1400.jpg"),
  routesCta: uploaded("/uploads/seed/southern-sea-table-cover.jpg"),

  shopHero: uploaded("/uploads/seed/zhanjiang-hero-1400-shop.jpg"),
  shopProduct: uploaded("/uploads/seed/volcanic-soil-bowl-1200.jpg"),
  shopProductSquare: uploaded("/uploads/seed/volcanic-soil-bowl-900.jpg"),

  interpretingHero: uploaded("/uploads/seed/pottery-workshop-1200.jpg"),
  interpretingShowcase: uploaded("/uploads/seed/southern-coast-1200.jpg"),

  // Generic ambient (volcanic landscape works as a neutral atmosphere shot)
  ambientLandscape: uploaded("/uploads/seed/volcanic-landscape-1200.jpg"),
} as const;

export type SeedImageKey = keyof typeof SEED_IMAGES;
