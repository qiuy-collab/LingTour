/**
 * Local placeholder assets for content awaiting editorial dispatch.
 *
 * These are *intentional* placeholders (not "broken image" fallbacks).
 * They live in /public/placeholders/ as static SVGs so any consumer that
 * expects a string image URL — Image src, background-image, og:image — can
 * use them directly.
 *
 * Once the admin UI ships and ops uploads real assets, these references
 * should naturally disappear from the database. Code that hardcodes them
 * (mostly hero CTAs) can be replaced with real CMS-driven imagery.
 *
 * Style: archive / paper / field-note. See public/placeholders/*.svg.
 */
export const PLACEHOLDERS = {
  /** Wide / hero (16:9). Use for big intro panels. */
  hero: "/placeholders/field-archive-hero.svg",
  /** Square (1:1). Use for cards, gallery cells, product thumbnails. */
  square: "/placeholders/field-archive-square.svg",
  /** Portrait (3:4). Use for vertical photos, polaroid-style cells. */
  portrait: "/placeholders/field-archive-portrait.svg",
} as const;

export type PlaceholderShape = keyof typeof PLACEHOLDERS;

/**
 * Return a placeholder URL for a given shape.
 *
 * Use this when you have a single image slot that may or may not be filled
 * by the API: `image || placeholderFor("hero")`.
 */
export function placeholderFor(shape: PlaceholderShape = "hero"): string {
  return PLACEHOLDERS[shape];
}
