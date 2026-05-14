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
