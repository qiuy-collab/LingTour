export type RegionSlug =
  | "guangzhou"
  | "shenzhen"
  | "foshan"
  | "chaozhou"
  | "shantou"
  | "meizhou"
  | "zhanjiang"
  | "shaoguan";

export type NavItem = {
  href: string;
  label: string;
  labelEn: string;
};

export type FeaturedRoute = {
  slug: string;
  title: string;
  theme: string;
  duration: string;
  audience: string;
  description: string;
};

export type CultureFeature = {
  slug: string;
  title: string;
  body: string;
  href?: string;
  image?: string;
  place?: string;
};

export type ServiceStep = {
  step: string;
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  name: string;
};

export type Region = {
  slug: RegionSlug;
  adcode: number;
  name: string;
  label: string;
  summary: string;
  narrative: string;
  tags: string[];
  food: string;
  routeSlugs: string[];
  serviceLabel: string;
  serviceHref: string;
  image: string;
  gallery: string[];
};

export type HomeHeroStat = {
  title: string;
  body: string;
};

/**
 * Editorial hero block on the home page.
 *
 * All fields are optional — when a field is missing the page falls back
 * to local Journal-style placeholders. The admin UI is responsible for
 * filling these slots.
 */
export type HomeHero = {
  /** Hero image URL (renders the rotated polaroid card on the right). */
  image?: string;
  /** Optional caption / tag rendered alongside the hero. */
  caption?: string;
  /** Image used by the bottom-of-page departure CTA. */
  ctaImage?: string;
  /**
   * Optional badge metric overlaying the hero (e.g. { value: "120+", label: "Routes" }).
   * If unset the page derives one from trustMetrics.
   */
  badge?: { value: string; label: string };
  /**
   * Optional accent label for the interpreting block image (e.g. "Bilingual Support").
   */
  interpretingLabel?: string;
  /**
   * Optional image for the interpreting / field-notes block.
   */
  interpretingImage?: string;
};

export type HomeEntryCard = {
  id: string;
  title: string;
  body: string;
  href: string;
};

export type TrustMetric = {
  value: string;
  label: string;
};
