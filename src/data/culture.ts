import { regionShowcase } from "@/data/home";

export type CityCulture = {
  slug: string;
  name: string;
  adcode: number;
  label: string;
  summary: string;
  narrative: string;
  image: string;
  gallery: string[];
  tags: string[];
  food: string;
  routeHref: string;
  sections: {
    title: string;
    body: string;
  }[];
};

const cityCultureDetails: Record<string, CityCulture["sections"]> = {
  guangzhou: [
    {
      title: "Arcade streets",
      body: "Guangzhou's arcade streets connect climate, trade, and neighborhood rhythm, turning daily walking into a cultural reading.",
    },
    {
      title: "Opera and river memory",
      body: "Cantonese opera, Pearl River docks, and old commercial quarters show how performance and trade shaped the city.",
    },
    {
      title: "Morning tea",
      body: "Dim sum is not only food; it is a social schedule, a language of hospitality, and a city ritual.",
    },
  ],
  shenzhen: [
    {
      title: "A young city",
      body: "Shenzhen culture is built from migration, speed, design, and the stories of people who arrived to make a new city.",
    },
    {
      title: "Coastal everyday life",
      body: "Bay parks, urban villages, creative districts, and waterfront routes make the city easy for international visitors to enter.",
    },
    {
      title: "Contemporary Guangdong",
      body: "The city adds a present-tense chapter to Lingnan culture, showing Guangdong as invention rather than only heritage.",
    },
  ],
  foshan: [
    {
      title: "Craft ground",
      body: "Ceramics, metalwork, and workshop streets give Foshan a strong material culture that visitors can see and touch.",
    },
    {
      title: "Stage and movement",
      body: "Lion dance, martial arts, and Cantonese opera connect physical training with public celebration.",
    },
    {
      title: "Shunde table",
      body: "Food culture in Foshan, especially Shunde, makes precision and freshness part of the cultural route.",
    },
  ],
  chaozhou: [
    {
      title: "Tea as etiquette",
      body: "Gongfu tea controls pace, distance, and conversation; it is one of the clearest ways to understand Chaozhou.",
    },
    {
      title: "Old city craft",
      body: "Wood carving, bridges, temples, and old lanes make the city feel like a careful sequence of details.",
    },
    {
      title: "Ritual life",
      body: "Ancestral halls and temple gatherings keep community memory visible in public space.",
    },
  ],
  shantou: [
    {
      title: "Harbor memory",
      body: "Shantou's treaty-port history and overseas Chinese links turn the city into a route about departure and return.",
    },
    {
      title: "Street food",
      body: "Food stalls, beef balls, rice rolls, and marinated dishes carry Chaoshan culture in everyday form.",
    },
    {
      title: "Coastal neighborhoods",
      body: "Old streets and port-facing communities connect family memory with the sea.",
    },
  ],
  meizhou: [
    {
      title: "Hakka home",
      body: "Meizhou centers the Hakka story through settlement, dialect, family memory, and the idea of home.",
    },
    {
      title: "Walled houses",
      body: "Architecture becomes a cultural text, showing defense, family structure, and communal living.",
    },
    {
      title: "Mountain table",
      body: "Salt-baked chicken, stuffed tofu, and rice wine make mountain life tangible for visitors.",
    },
  ],
  zhanjiang: [
    {
      title: "Southern coast",
      body: "Zhanjiang gives Guangdong a maritime scale through islands, seafood markets, and volcanic coastline.",
    },
    {
      title: "Fishing communities",
      body: "The rhythm of fishing, markets, and coastal meals creates a route that starts with the sea.",
    },
    {
      title: "Volcanic landscape",
      body: "Landform changes the feeling of the province, moving visitors from delta imagination to southern shore.",
    },
  ],
  shaoguan: [
    {
      title: "Northern gateway",
      body: "Shaoguan opens a slower northern Guangdong through mountains, old passes, temples, and Danxia landforms.",
    },
    {
      title: "Red cliffs",
      body: "Danxia gives the region a visual identity that can become the start of a story route.",
    },
    {
      title: "Mountain roads",
      body: "Food, roads, and landscapes make Shaoguan a strong counterpoint to the Pearl River Delta.",
    },
  ],
};

export const cityCultures: CityCulture[] = regionShowcase.map((city) => ({
  slug: city.slug,
  name: city.name,
  adcode: city.adcode,
  label: city.label,
  summary: city.summary,
  narrative: city.narrative,
  image: city.image,
  gallery: city.gallery,
  tags: city.tags,
  food: city.food,
  routeHref: city.routeHref,
  sections: cityCultureDetails[city.slug] ?? [
    {
      title: "Local culture",
      body: city.narrative,
    },
  ],
}));

export function getCityCulture(slug: string) {
  return cityCultures.find((city) => city.slug === slug);
}
