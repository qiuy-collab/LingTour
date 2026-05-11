export type StoryRoute = {
  slug: string;
  title: string;
  culture: "Guangfu" | "Chaoshan" | "Hakka" | "Coastal" | "Bay Area" | "Mountain";
  city: string;
  citySlugs: string[];
  duration: string;
  audience: string;
  summary: string;
  story: string;
  image: string;
  mapViewBox: string;          // SVG viewBox for the route map
  itinerary: {
    time: string;
    stop: string;
    plan: string;
    story: string;
    details: string[];
    culturalStory: string;
    lat: number;               // Geographic coordinate
    lng: number;               // Geographic coordinate
    placeDetail?: string;
    meal?: string;
    hotel?: string;
    transit?: string;
    image?: string;
  }[];
};

// Helper: convert geo coords to SVG pixel coords for the route map
// viewBox: "0 0 900 600" covering lat 21.10–21.32, lng 110.24–110.48
function geoToSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - 110.24) / 0.24) * 900;
  const y = ((21.32 - lat) / 0.22) * 600;
  return { x: Math.round(x), y: Math.round(y) };
}

export const storyRoutes: StoryRoute[] = [
  {
    slug: "southern-sea-table",
    title: "A Southern Sea Table",
    culture: "Coastal",
    city: "Zhanjiang",
    citySlugs: ["zhanjiang"],
    duration: "1 day",
    audience: "Curious travellers",
    summary:
      "A one-day route through Zhanjiang: volcanic crater lake at dawn, seafood auction mid-morning, French colonial streets in the afternoon, and a sunset dinner facing the South China Sea.",
    story:
      "This route meets Zhanjiang where the city begins — at the water. Before the factories and the highways, the sea shaped this coast. Every stop traces back to that relationship.",
    image:
      "https://picsum.photos/seed/zhanjiang-coast/1400/900",
    mapViewBox: "0 0 900 600",
    itinerary: [
      {
        time: "08:00",
        stop: "Huguangyan Maar Lake",
        lat: 21.147,
        lng: 110.277,
        plan: "",
        story:
          "Start at a volcanic lake formed 160,000 years ago — a UNESCO geopark, ringed by basalt cliffs and a 2.3 km walking trail.",
        details: [
          "Enter the UNESCO Global Geopark at the southwest edge of the city",
          "Walk the 2.3 km rim trail around the largest intact maar lake in the world",
          "Step into the volcanic geology museum built into the crater wall",
          "Watch leaves sink on contact — one of three phenomena science still cannot explain here",
        ],
        culturalStory:
          "Huguangyan formed roughly 160,000 years ago when rising magma met groundwater and exploded, creating a maar lake — one of only two in the world whose volcanic structure remains fully intact. It was designated a UNESCO Global Geopark in 2004.\n\nThe circular lake spans 1.8 km across, ringed by a 2.3 km walking trail. At 22 metres deep, its water level remains constant through both monsoon and drought — a phenomenon still unexplained. No frogs or snakes have ever been observed in or around the lake, and fallen leaves sink within seconds of touching the surface. Science has no definitive answers.\n\nLi Gang, a prime minister of the Southern Song Dynasty, was exiled here and wrote poems about the lake's still surface. Lengyan Temple on the southern shore has been an active Buddhist site since the Tang Dynasty.",
        image:
          "https://picsum.photos/seed/huguangyan-lake/1200/800",
      },
      {
        time: "11:00",
        stop: "Dongfeng Seafood Market",
        lat: 21.196,
        lng: 110.404,
        plan: "",
        story:
          "Western Guangdong's largest seafood wholesale market. The morning catch arrives straight from the harbour.",
        details: [
          "Enter the largest seafood wholesale market in western Guangdong",
          "Follow the mid-morning auction — bids are sung in Leizhou dialect, not Mandarin",
          "Learn to read the day's catch: silver pomfret, mantis shrimp, grouper, flower crab",
          "Eat freshly shucked oysters and steamed sea perch at a stall inside the market",
        ],
        culturalStory:
          "Dongfeng Market sits beside Xiashan's old fishing harbour, where Zhanjiang's fleet has docked for over a century. It is the largest seafood wholesale market in western Guangdong. The morning's haul travels from boat to stall in under two hours — silver pomfret on ice, mantis shrimp clicking in tubs, cuttlefish ink still wet on the concrete floor.\n\nBidding is conducted in Leizhou dialect, a branch of Min Chinese that predates Mandarin in this region. Prices are called out in a musical rhythm; regular buyers know each boat by name. Zhanjiang earned its title as China's Seafood Capital through geography: the warm South China Sea meets the nutrient-rich waters of the Beibu Gulf here, creating one of the richest fishing grounds on China's southern coast. The market's daily chalkboard is a seasonal calendar — spring squid, summer prawn, autumn crab, winter grouper.",
        image:
          "https://picsum.photos/seed/dongfeng-market/1200/800",
      },
      {
        time: "14:00",
        stop: "Xiashan French Heritage",
        lat: 21.197,
        lng: 110.411,
        plan: "",
        story:
          "Walk the streets of Kwangchouwan, the French leased territory that governed this port from 1899 to 1945.",
        details: [
          "Walk Haibin Avenue past the French customs house, built in 1913",
          "Visit the Catholic church — coral stone walls, French stained glass, 1903",
          "Pass colonial villas on Dongdi Road that are now family homes",
          "Stop at the former police station, today a museum of the French period",
        ],
        culturalStory:
          "From 1899 to 1945, Zhanjiang was not Chinese territory. It was Kwangchouwan — a French leased territory roughly the size of Hong Kong, administered from Hanoi as part of French Indochina. The French built a deep-water port, a railway, and a European quarter along what is now Haibin Avenue, calling the settlement Fort Bayard.\n\nAt its peak, fewer than 300 Europeans lived here, but their architectural imprint remains. The twin-spired Catholic church on Lüyin Road (built 1903) uses local coral stone for its walls and French stained glass for its windows — a fusion found nowhere else. The former customs house (1913), with its arched colonnade and Marseille tiles, now stands between a hotpot restaurant and a mobile phone shop.\n\nUnlike the grand colonial monuments of Shanghai's Bund or Guangzhou's Shamian, Xiashan's French quarter is still lived in. A former villa is now a kindergarten. The old post office is a tea house. History here is not preserved under glass — it is stacked within the everyday.",
        image:
          "https://picsum.photos/seed/xiashan-french/1200/800",
      },
      {
        time: "17:30",
        stop: "Jinsha Bay & Seafood Dinner",
        lat: 21.249,
        lng: 110.427,
        plan: "",
        story:
          "A seafood dinner at Jinsha Bay, where every dish traces back to a stop from earlier in the day.",
        details: [
          "Reach Jinsha Bay as the late-afternoon light hits the South China Sea",
          "Walk the 4 km beachfront promenade as the city shifts from day to evening",
          "Sit at a seaside restaurant for a Lingnan seafood dinner — multiple courses, one table",
          "Each course — steamed fish, salt-baked crab, oyster congee — comes from a place passed earlier on the route",
        ],
        culturalStory:
          "The final stop is a table facing south — chaonan, the most auspicious orientation in Lingnan dining, facing the source of warmth and abundance.\n\nA Zhanjiang seafood dinner follows a ritual unchanged for centuries. It begins with a clear broth, made from the bones and shells of the day's catch, cleansing the palate. Then comes steamed whole fish, unadorned — the Lingnan ultimate test of freshness. No sauce can hide a fish less than perfect: the flesh should flake from the bone at the gentlest touch of chopsticks, and the eye should be clear. Garlic-steamed prawns follow, then salt-baked crab, and finally oyster congee. Every dish traces back to a place passed earlier in the day — the fish from the morning harbour, the dried oysters from a fishing village on the way, the rice grown in volcanic soil. The meal is not separate from the route. It is the route's final chapter, edible and specific.",
        image:
          "https://picsum.photos/seed/jinsha-bay/1200/800",
        meal: "Seafood dinner",
      },
    ],
  },
];

export function getStoryRoute(slug: string) {
  return storyRoutes.find((route) => route.slug === slug);
}

// Export the geo-to-SVG converter for the map component
export { geoToSVG };
