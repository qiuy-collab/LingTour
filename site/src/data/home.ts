import type {
  CultureFeature,
  FeaturedRoute,
  HomeEntryCard,
  HomeHeroStat,
  Region,
  ServiceStep,
  Testimonial,
  TrustMetric,
} from "@/types/content";

export const homeHeroStats: HomeHeroStat[] = [
  { title: "Audience", body: "International visitors, exchange students, and curious travellers in Guangdong" },
  { title: "What we offer", body: "City culture stories, story-shaped routes, interpreter booking, and Lingnan objects" },
  { title: "Why it works", body: "Each route carries a single cultural thread — food, craft, migration, or maritime life" },
  { title: "Where to start", body: "Pick a city on the map, browse a route, or book interpretation" },
];

export const trustMetrics: TrustMetric[] = [
  { value: "1", label: "Featured city" },
  { value: "1", label: "Story route" },
  { value: "1", label: "Cultural collection" },
];

export const homeEntryCards: HomeEntryCard[] = [
  {
    id: "01",
    title: "Culture",
    body: "Read city stories that explain the food, craft, and daily life behind each destination.",
    href: "/culture",
  },
  {
    id: "02",
    title: "Story Routes",
    body: "Follow a route built around a single idea — a market, a coastline, a craft tradition.",
    href: "/routes",
  },
  {
    id: "03",
    title: "Interpreter Service",
    body: "Book English-speaking local support for the day: transport, menus, tickets, and cultural context.",
    href: "/interpreting",
  },
  {
    id: "04",
    title: "Lingnan Store",
    body: "Take home objects tied to the routes — ceramics, textiles, and objects with a story.",
    href: "/shop",
  },
];

export const featuredRoutes: FeaturedRoute[] = [
  {
    slug: "southern-sea-table",
    title: "A Southern Sea Table",
    theme: "Coastal maritime life",
    duration: "1 day",
    audience: "Coastal explorers",
    description:
      "A Zhanjiang route: morning seafood auction, volcanic crater lake, French colonial streets, and dinner facing the South China Sea.",
  },
];

export const cultureHighlights: CultureFeature[] = [
  {
    slug: "zhanjiang",
    title: "Southern Coast",
    body: "Volcanic shorelines, fishing harbours, seafood markets, and maritime life at the southern tip of mainland China.",
  },
];

export const serviceSteps: ServiceStep[] = [
  {
    step: "01",
    title: "Choose a city or route",
    description: "Start from the map, a featured route, or a culture theme that fits your travel plans.",
  },
  {
    step: "02",
    title: "Select interpretation",
    description: "Tell us the date, language, group size, and type of support you need.",
  },
  {
    step: "03",
    title: "Confirm the details",
    description: "We lock in the meeting point, stops, pacing, and cultural focus before your visit.",
  },
  {
    step: "04",
    title: "Travel with context",
    description: "Practical help and cultural explanation delivered together, across every stop.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "I arrived knowing nothing about Zhanjiang. I left understanding why every dish on the table mattered.",
    name: "Lina, exchange student from Singapore",
  },
  {
    quote: "Our interpreter didn't just translate — she explained why the market auction sounded like singing.",
    name: "Marcus, first-time visitor from the UK",
  },
  {
    quote: "The route connected food, volcanic geology, and colonial history into a single, calm arc.",
    name: "Aya, culture researcher from Tokyo",
  },
];

export const regionShowcase: Region[] = [
  {
    slug: "zhanjiang",
    adcode: 440800,
    name: "Zhanjiang",
    label: "Southern coast",
    summary: "Seafood markets, volcanic coastline, French colonial heritage, and maritime life.",
    narrative:
      "At the southern tip of mainland China, Zhanjiang faces the open sea. Its rhythm is set by tides and auctions, not highways. Volcanic crater lakes, fishing harbours, and colonial streets sit within a single day's reach.",
    tags: ["Coast", "Seafood", "Volcanic landscape"],
    food: "Oysters, white-cut chicken, seafood porridge",
    routeSlugs: ["southern-sea-table"],
    serviceLabel: "Book Zhanjiang Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];
