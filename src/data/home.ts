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
  { title: "Audience", body: "International visitors in Guangdong" },
  { title: "Core Model", body: "Culture stories, guided routes, service booking" },
  { title: "Travel Logic", body: "Routes shaped as narratives, not checklists" },
  { title: "Next Step", body: "Book interpretation or enter a story route" },
];

export const trustMetrics: TrustMetric[] = [
  { value: "21", label: "Guangdong cities" },
  { value: "8", label: "Starter focus cities" },
  { value: "3", label: "Lingnan culture lines" },
];

export const homeEntryCards: HomeEntryCard[] = [
  {
    id: "01",
    title: "Culture",
    body: "Understand Guangfu, Chaoshan, and Hakka culture through concise editorial stories.",
    href: "/culture",
  },
  {
    id: "02",
    title: "Story Routes",
    body: "Follow routes built around memory, food, craft, migration, opera, and coastal life.",
    href: "/routes",
  },
  {
    id: "03",
    title: "Interpreter Service",
    body: "Reserve city companionship, cultural interpretation, and route support for visitors.",
    href: "/interpreting",
  },
  {
    id: "04",
    title: "Lingnan Store",
    body: "Discover culture-linked products that let a journey continue after the visit.",
    href: "/shop",
  },
];

export const featuredRoutes: FeaturedRoute[] = [
  {
    slug: "arcades-and-harbor-wind",
    title: "Between Arcades and Harbor Wind",
    theme: "Guangfu city memory",
    duration: "1 day",
    audience: "First-time visitors, urban walkers",
    description:
      "A Guangzhou and Foshan route that turns arcades, dim sum, opera echoes, and old commercial streets into a story about trade, migration, and everyday elegance.",
  },
  {
    slug: "drums-tea-and-tides",
    title: "Where Drums, Tea, and Tides Meet",
    theme: "Chaoshan ritual life",
    duration: "2 days",
    audience: "Culture lovers, food travelers",
    description:
      "A Chaozhou and Shantou journey following tea tables, ancestral halls, Yingge dance, harbor memory, and the living rhythm of Chaoshan communities.",
  },
  {
    slug: "behind-the-walled-village",
    title: "Behind the Walled Village",
    theme: "Hakka migration and home",
    duration: "2 days",
    audience: "Slow travelers, heritage researchers",
    description:
      "A mountain route through Meizhou and northern Guangdong, connecting walled houses, family migration, mountain food, and stories of belonging.",
  },
];

export const cultureHighlights: CultureFeature[] = [
  {
    slug: "guangfu",
    title: "Guangfu",
    body: "Arcade streets, Cantonese opera, dim sum, trade routes, and city craft form the urban face of Lingnan culture.",
  },
  {
    slug: "chaoshan",
    title: "Chaoshan",
    body: "Tea rituals, ancestral halls, Yingge dance, temple fairs, and harbor communities shape a dense coastal culture.",
  },
  {
    slug: "hakka",
    title: "Hakka",
    body: "Walled villages, migration memory, mountain settlements, and family narratives offer a quieter but powerful route into Guangdong.",
  },
];

export const serviceSteps: ServiceStep[] = [
  {
    step: "01",
    title: "Choose a city or story route",
    description: "Start from the map, a featured route, or a culture theme that matches your travel interest.",
  },
  {
    step: "02",
    title: "Select interpretation support",
    description: "Pick language support, date, route, group size, and the type of companionship you need.",
  },
  {
    step: "03",
    title: "Confirm the route details",
    description: "We align timing, meeting point, core stops, service boundaries, and cultural focus before the visit.",
  },
  {
    step: "04",
    title: "Travel with a story thread",
    description: "The experience keeps practical guidance and cultural storytelling in the same journey.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "It felt like Guangdong was introduced through stories rather than a checklist of attractions.",
    name: "Lina, exchange student",
  },
  {
    quote: "The route language made the city easier to understand for our overseas guests.",
    name: "Marcus, first-time visitor",
  },
  {
    quote: "Food, craft, and local memory were connected in a way that felt natural and calm.",
    name: "Aya, culture enthusiast",
  },
];

export const regionShowcase: Region[] = [
  {
    slug: "guangzhou",
    adcode: 440100,
    name: "Guangzhou",
    label: "Guangfu gateway",
    summary: "Arcades, dim sum, opera memory, and Pearl River trade routes.",
    narrative:
      "Guangzhou is the first chapter for many visitors: a city where trade, language, food, and neighborhood rituals keep rewriting Lingnan identity.",
    tags: ["Guangfu", "Arcades", "Cantonese opera"],
    food: "Dim sum, wonton noodles, double-skin milk",
    routeName: "Between Arcades and Harbor Wind",
    routeShort: "Arcade Memory",
    routeSummary:
      "A city walk from arcade streets to the Pearl River, following trade, opera, and neighborhood food.",
    routeHref: "/routes/arcades-and-harbor-wind",
    serviceLabel: "Book Guangzhou Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "shenzhen",
    adcode: 440300,
    name: "Shenzhen",
    label: "Bay area frontier",
    summary: "Design, coastline, urban speed, and contemporary cultural life.",
    narrative:
      "Shenzhen adds a modern chapter to Guangdong: design districts, coastal parks, migrant stories, and a city rhythm shaped by invention.",
    tags: ["Design", "Coastline", "Urban culture"],
    food: "Seafood, Cantonese comfort food, creative cafes",
    routeName: "The Young City by the Bay",
    routeShort: "Young Bay Route",
    routeSummary:
      "A contemporary bay route through design districts, coastal parks, and the migrant story of a young city.",
    routeHref: "/routes/young-city-by-the-bay",
    serviceLabel: "Book Shenzhen Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "foshan",
    adcode: 440600,
    name: "Foshan",
    label: "Craft and opera",
    summary: "Ceramics, martial arts, lion dance, and Cantonese opera roots.",
    narrative:
      "Foshan gives the Guangfu route its craft texture: kilns, ancestral halls, lion dance, and the stage language behind Cantonese opera.",
    tags: ["Ceramics", "Lion dance", "Opera"],
    food: "Shunde cuisine, double-skin milk, fish skin",
    routeName: "Craft, Stage, and Family Halls",
    routeShort: "Craft Stage",
    routeSummary:
      "A craft-led route linking ceramics, ancestral halls, lion dance, and the stage roots of Cantonese opera.",
    routeHref: "/routes/craft-stage-family-halls",
    serviceLabel: "Book Foshan Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "chaozhou",
    adcode: 445100,
    name: "Chaozhou",
    label: "Tea and ritual",
    summary: "Tea tables, ancestral halls, bridges, temples, and fine craft.",
    narrative:
      "Chaozhou is best read slowly: tea, wood carving, temple fairs, old lanes, and a social rhythm that turns hospitality into an art.",
    tags: ["Gongfu tea", "Ancestral halls", "Craft"],
    food: "Beef hotpot, kway teow soup, oyster omelette",
    routeName: "Where Drums, Tea, and Tides Meet",
    routeShort: "Tea and Ritual",
    routeSummary:
      "A slow route through tea tables, old bridges, ancestral halls, and the ritual pulse of Chaoshan life.",
    routeHref: "/routes/drums-tea-and-tides",
    serviceLabel: "Book Chaozhou Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "shantou",
    adcode: 440500,
    name: "Shantou",
    label: "Harbor memory",
    summary: "Treaty-port streets, coastal food, and overseas Chinese memory.",
    narrative:
      "Shantou connects the Chaoshan story to the sea, following old port streets, family letters, food stalls, and the memory of departure.",
    tags: ["Harbor", "Overseas Chinese", "Street food"],
    food: "Beef balls, rice rolls, Chaoshan marinated dishes",
    routeName: "Letters from the Harbor",
    routeShort: "Harbor Letters",
    routeSummary:
      "A harbor route following old streets, overseas Chinese memory, street food, and the language of departure.",
    routeHref: "/routes/letters-from-the-harbor",
    serviceLabel: "Book Shantou Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "meizhou",
    adcode: 441400,
    name: "Meizhou",
    label: "Hakka home",
    summary: "Walled villages, mountain food, migration stories, and family memory.",
    narrative:
      "Meizhou anchors the Hakka thread: a quieter route through mountain settlements, walled houses, clan stories, and the meaning of home.",
    tags: ["Hakka", "Walled villages", "Migration"],
    food: "Salt-baked chicken, stuffed tofu, Hakka rice wine",
    routeName: "Behind the Walled Village",
    routeShort: "Walled Village",
    routeSummary:
      "A Hakka route through walled houses, mountain settlements, clan stories, and the meaning of home.",
    routeHref: "/routes/behind-the-walled-village",
    serviceLabel: "Book Meizhou Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "zhanjiang",
    adcode: 440800,
    name: "Zhanjiang",
    label: "Southern coast",
    summary: "Volcanic coastline, seafood, islands, and maritime life.",
    narrative:
      "Zhanjiang opens the southern sea chapter, where volcanic landscapes, fishing communities, and seafood markets create a different Guangdong texture.",
    tags: ["Coast", "Seafood", "Volcanic landscape"],
    food: "Oysters, white-cut chicken, seafood porridge",
    routeName: "A Southern Sea Table",
    routeShort: "Southern Sea",
    routeSummary:
      "A coastal route across seafood markets, volcanic shorelines, islands, and fishing communities.",
    routeHref: "/routes/southern-sea-table",
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
  {
    slug: "shaoguan",
    adcode: 440200,
    name: "Shaoguan",
    label: "Mountain north",
    summary: "Danxia landforms, mountain routes, temples, and northern gateways.",
    narrative:
      "Shaoguan gives the route a northern horizon: red cliffs, mountain air, temples, old passes, and slower landscapes beyond the delta.",
    tags: ["Danxia", "Mountains", "Slow travel"],
    food: "Mountain vegetables, rice noodles, smoked specialties",
    routeName: "Red Cliffs and Northern Roads",
    routeShort: "Red Cliffs",
    routeSummary:
      "A northern route through Danxia cliffs, temples, mountain roads, and the slower edge of Guangdong.",
    routeHref: "/routes/red-cliffs-northern-roads",
    serviceLabel: "Book Shaoguan Support",
    serviceHref: "/interpreting",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];
