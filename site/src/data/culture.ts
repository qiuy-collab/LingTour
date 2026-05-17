import { regionShowcase } from "@/data/home";

export type CityCultureSection = {
  title: string;
  body: string;
  image: string;
  stat?: string;
  breathImage?: string;
  breathQuote?: string;
};

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
  foodDescription: string;
  routeSlugs: string[];
  relatedCitySlugs: string[];
  foodImages: string[];
  sections: CityCultureSection[];
};

const cityCultureDetails: Record<
  string,
  Pick<CityCulture, "sections" | "foodImages">
> = {
  zhanjiang: {
    foodImages: [
      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    ],
    sections: [
      {
        title: "Southern coast",
        body: "Zhanjiang sits at the southern tip of mainland China, facing the South China Sea across 1,243 km of coastline. It is not the Pearl River Delta. There are no factory clusters or expressway networks here. Instead: beaches that run for kilometres without a high-rise in sight, black basalt headlands carved into platforms by the surf, mangrove estuaries, and more than 100 offshore islands among them.\n\nThe coast follows a daily rhythm. Dawn belongs to fishing boats motoring out through sheltered channels. Mid-morning, the catch moves to market. Midday, the city eats. Late afternoon fills the beaches with swimmers. By dusk, the coast returns to the sea.\n\nFor a visitor, this is not a drive-by destination. It is a place to walk, eat, and watch. The southern coast marks the line where Guangdong stops being a river civilisation and becomes an ocean one.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        stat: "1,243 km of coastline / 100+ offshore islands / 3 national nature reserves",
        breathImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        breathQuote: "This is not a shoreline you photograph once. It is a daily rhythm: tides, market cries, the salt-sweet smell of the morning haul.",
      },
      {
        title: "Fishing communities",
        body: "Fishing is not an exhibit in Zhanjiang. It is the economy, the calendar, and the social fabric. Along nearly every inlet and river mouth, a fishing village faces the water. Houses are built from coral stone or concrete. The day begins before sunrise, when boats motor out through the channel, their lights still visible in the dark.\n\nThese villages run on their own logic. Men go out on boats. Women sort the catch, sell it, and preserve the rest. Children learn fish names before street names. The village elder reads weather patterns the way a city person reads a metro map.\n\nThe market is the best place to understand this world. It is not designed for visitors. The floor is wet. Ice glistens. Bargaining happens in Leizhou Min, a dialect unintelligible to Mandarin speakers. Walking through, you read the coast through what sits on the table.\n\nThese communities are under pressure. Younger people are moving to cities. Industrial fleets compete with traditional boats. Climate shifts are altering fish stocks.",
        image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
        stat: "100+ fishing villages / 10,000+ families living from the sea",
        breathImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
        breathQuote: "What arrives on the table tonight was in open water this morning. Zhanjiang does not sit beside the sea. It lives on it.",
      },
      {
        title: "Volcanic landscape",
        body: "Few travellers expect to find volcanoes in Guangdong, but the Leizhou Peninsula was shaped by eruptions over the past several million years. The result is a landscape that feels nothing like the rest of the province: black basalt outcrops, dark fertile soil, and a coastline where lava once met the sea.\n\nThe best place to see this is Naozhou Island, where hexagonal basalt columns rise from the water. Formed by the slow cooling of lava, they stand in geometric ranks, like a pipe organ built for the ocean.\n\nThat volcanic soil powers Zhanjiang's farms. Pineapple plantations, sugarcane fields, and banana groves all owe their fertility to ancient eruptions. There is a direct line between the volcanoes of the past and the abundance on today's tables.",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
        stat: "80+ volcanic cones / shaped over 1 million years",
      },
    ],
  },
};

export const cityCultures: CityCulture[] = regionShowcase.map((city) => {
  const details = cityCultureDetails[city.slug];
  return {
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
    foodDescription: city.narrative,
    routeSlugs: city.routeSlugs,
    relatedCitySlugs: [],
    foodImages: details?.foodImages ?? [],
    sections: details?.sections ?? [
      {
        title: "Local culture",
        body: city.narrative,
        image: city.image,
      },
    ],
  };
});

export function getCityCulture(slug: string) {
  return cityCultures.find((city) => city.slug === slug);
}
