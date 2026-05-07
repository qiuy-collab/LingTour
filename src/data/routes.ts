export type StoryRoute = {
  slug: string;
  title: string;
  culture: "Guangfu" | "Chaoshan" | "Hakka" | "Coastal" | "Bay Area" | "Mountain";
  city: string;
  cities: string[];
  duration: string;
  audience: string;
  summary: string;
  story: string;
  image: string;
  chapters: {
    label: string;
    title: string;
    place: string;
    story: string;
  }[];
  itinerary: {
    time: string;
    stop: string;
    plan: string;
    story: string;
    placeDetail?: string;
    meal?: string;
    hotel?: string;
    transit?: string;
    image?: string;
  }[];
};

export const storyRoutes: StoryRoute[] = [
  {
    slug: "arcades-and-harbor-wind",
    title: "Between Arcades and Harbor Wind",
    culture: "Guangfu",
    city: "Guangzhou / Foshan",
    cities: ["Guangzhou", "Foshan"],
    duration: "1 day",
    audience: "First-time visitors",
    summary:
      "A city route about trade, performance, and daily elegance, moving from arcade streets to opera memory and a Cantonese table.",
    story:
      "This route follows how a port city learned to live with heat, rain, commerce, family memory, and performance. The route begins with the arcade as shelter, turns toward opera and ancestral halls, and ends at the Cantonese table.",
    image:
      "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Opening",
        title: "A Street Built for Sun and Rain",
        place: "Guangzhou arcade streets",
        story: "Start with climate and commerce: the arcade becomes a public room for city life.",
      },
      {
        label: "Turn",
        title: "The Stage Behind the Neighborhood",
        place: "Foshan opera and ancestral halls",
        story: "Move from shopfronts to performance, where family memory and public ritual meet.",
      },
      {
        label: "Return",
        title: "Morning Tea as City Language",
        place: "Cantonese table",
        story: "End with food as a cultural interface, not just a meal.",
      },
    ],
    itinerary: [
      {
        time: "09:00",
        stop: "Guangzhou arcade streets",
        plan: "Walk through arcade blocks and old commercial streets.",
        story: "The arcade is the route opening image: a street built for climate, trade, and social life.",
      },
      {
        time: "11:00",
        stop: "Opera and neighborhood memory",
        plan: "Visit a Cantonese opera-related space or local heritage block.",
        story: "Performance shows how public ritual, family life, and city identity overlap.",
      },
      {
        time: "13:00",
        stop: "Cantonese lunch",
        plan: "Use food as the cultural interpretation stop.",
        story: "The table turns city memory into taste, pacing, and hospitality.",
      },
      {
        time: "15:00",
        stop: "Foshan craft stop",
        plan: "Continue toward craft, ceramics, or lion dance context.",
        story: "Foshan adds material culture and movement to the Guangfu route.",
      },
    ],
  },
  {
    slug: "young-city-by-the-bay",
    title: "The Young City by the Bay",
    culture: "Bay Area",
    city: "Shenzhen",
    cities: ["Shenzhen"],
    duration: "1 day",
    audience: "Design and city-life travelers",
    summary:
      "A contemporary route through design districts, coastal parks, and the migrant story of a young city.",
    story:
      "Shenzhen is not read through ancient monuments first. Its story begins with arrival, speed, experiment, and the bay. The route follows a city still being made: from creative blocks to waterfront life and the everyday cultures of people who came here to build.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Arrival",
        title: "A City Made by Newcomers",
        place: "Urban village or city memory stop",
        story: "Begin with migration as the city foundation, where personal arrival becomes collective identity.",
      },
      {
        label: "Design",
        title: "Where Work Becomes Culture",
        place: "Design district",
        story: "Shenzhen turns production, technology, and visual culture into a public-facing city language.",
      },
      {
        label: "Bay",
        title: "A Coastline for the Future",
        place: "Coastal park",
        story: "The route closes at the bay, where the city feels open, young, and still unfinished.",
      },
    ],
    itinerary: [
      {
        time: "09:30",
        stop: "Urban village context",
        plan: "Introduce Shenzhen through migration, density, and everyday neighborhood life.",
        story: "The city begins with people arriving, adapting, and remaking space.",
      },
      {
        time: "11:30",
        stop: "Design district",
        plan: "Visit a creative block, gallery, bookstore, or design retail space.",
        story: "Design becomes Shenzhen culture because the city thinks by making.",
      },
      {
        time: "14:30",
        stop: "Bayfront walk",
        plan: "Move toward a coastal park and read skyline, sea, and public life together.",
        story: "The bay gives the route its horizon: fast, open, and international.",
      },
      {
        time: "17:30",
        stop: "Creative dinner stop",
        plan: "End with contemporary Cantonese comfort food or a creative cafe.",
        story: "The table reflects a young city where local and global tastes sit together.",
      },
    ],
  },
  {
    slug: "craft-stage-family-halls",
    title: "Craft, Stage, and Family Halls",
    culture: "Guangfu",
    city: "Foshan",
    cities: ["Foshan"],
    duration: "1 day",
    audience: "Craft, performance, and food travelers",
    summary:
      "A Foshan route linking the Ancestral Temple, Lingnan Tiandi, Nanfeng Ancient Kiln, and Shunde food culture into one Guangfu story.",
    story:
      "Foshan should not be introduced as a list of old buildings. It is better read as a city where Guangfu culture becomes physical: a temple becomes a stage, a stage becomes martial movement, clay becomes memory, and a meal becomes the final act of craftsmanship. This route begins around Zumiao, where folk worship, Cantonese opera, lion dance, Wong Fei-hung memory, and Ip Man memory overlap in one compact cultural field. It then steps into Lingnan Tiandi, where restored lanes and commercial life show how heritage survives by being used. The afternoon moves to Shiwan and Nanfeng Ancient Kiln, turning the visitor from spectator into maker. The final chapter goes to Shunde, because Foshan food culture is not a side note; it is another form of precision, timing, and local pride.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Foshan%20Ancestral%20Temple%200.jpg?width=1600",
    chapters: [
      {
        label: "Material",
        title: "Before the Stage, There Is a Temple",
        place: "Foshan Ancestral Temple / Wong Fei-hung Memorial Hall / Ip Man Hall",
        story:
          "The first stop is Zumiao, not because it is simply famous, but because it gathers several Foshan identities in one place. The Ancestral Temple was built around Beidi worship, but the visitor quickly sees that worship here is not separated from performance. The Wanfu Stage, Cantonese opera memory, martial arts displays, lion dance, and the halls connected with Wong Fei-hung and Ip Man make the temple feel like a living stage. The story to tell international visitors is this: in Foshan, belief, public gathering, self-defense, neighborhood pride, and performance grew beside each other. A lion dance is not decoration; it is discipline made festive. Martial arts are not only combat; they are local ethics, posture, and memory.",
      },
      {
        label: "Hall",
        title: "Old Lanes That Learned to Stay Alive",
        place: "Lingnan Tiandi / Donghuali historic area",
        story:
          "After the intensity of the temple, Lingnan Tiandi gives the route a different question: what happens to heritage when people still need to eat, shop, meet friends, and live in the city? The district keeps old Lingnan architectural traces and connects them with restaurants, cafes, retail, hotels, and evening life. This is where the route should slow down. The story is not only preservation; it is adaptation. For an international visitor, this stop helps explain why Lingnan culture often feels practical rather than museum-like. It survives through shade, courtyards, shopfronts, family halls, and small everyday decisions about how old space can still host new life.",
      },
      {
        label: "Stage",
        title: "The Kiln That Turns Earth Into Memory",
        place: "Nanfeng Ancient Kiln / Shiwan ceramics area",
        story:
          "Shiwan changes the language of the route from sound and movement to fire and touch. Nanfeng Ancient Kiln is tied to Foshan pottery heritage, and the best interpretation here is not to treat ceramics as souvenirs. Clay records labor. Kiln fire records risk. A vessel records the patience of repeated trial. The story connects naturally with the morning: lion dance trains the body; pottery trains the hand. Both are forms of discipline passed through practice rather than explanation. A pottery workshop or slow walk through the kiln area gives visitors a tactile chapter, making Guangfu culture feel less abstract and more embodied.",
      },
      {
        label: "Table",
        title: "Shunde: Craft Logic at the Table",
        place: "Qinghui Garden / Huagai Road / Jinbang Street",
        story:
          "The last chapter should be food, because Shunde cuisine is where craft becomes edible. Qinghui Garden gives a quiet garden frame, then Huagai Road and Jinbang Street bring the traveler into dessert shops, milk desserts, snacks, and local food streets. Double-skin milk is useful as a story object: it looks simple, but it depends on milk quality, heat, timing, and texture. That is the same cultural logic the route has been following all day. The visitor has moved from temple ritual to urban renewal, from clay and fire to milk and steam. Foshan ends not with a postcard view, but with a table that explains why local culture often hides its complexity inside everyday pleasure.",
      },
    ],
    itinerary: [
      {
        time: "09:00",
        stop: "Foshan Ancestral Temple",
        plan:
          "Start at Foshan Ancestral Temple, then include the Wong Fei-hung Memorial Hall and Ip Man Hall inside the same cultural area when available.",
        story:
          "This is the route opening stage: public worship, Cantonese opera, lion dance, and martial arts memory share one cultural space.",
        placeDetail:
          "No.21 Zumiao Road, Chancheng District. Use this as the morning anchor because the site is compact and strongly connected to Foshan folk culture.",
        meal:
          "Morning snack nearby: choose a simple Cantonese breakfast or wait for Lingnan Tiandi lunch so the first stop stays focused.",
        hotel:
          "Best overnight base: Lingnan Tiandi / Zumiao area, especially international-friendly hotels near the temple district.",
        transit:
          "Arrive by Foshan Metro to Zumiao area or by taxi from central Guangzhou/Foshan. Keep the morning walk mostly on foot.",
        image:
          "https://commons.wikimedia.org/wiki/Special:FilePath/Foshan%20Ancestral%20Temple%200.jpg?width=1600",
      },
      {
        time: "11:00",
        stop: "Lingnan Tiandi",
        plan:
          "Walk from the temple district into Lingnan Tiandi and Donghuali-style lanes; use the stop for architecture, shade, old-new reuse, and lunch.",
        story:
          "This stop explains how heritage continues when old lanes become daily urban life rather than frozen scenery.",
        placeDetail:
          "Lingnan Tiandi sits in central Chancheng near Zumiao and is suitable for a slow walk, restaurant stop, and photo-heavy interpretation.",
        meal:
          "Lunch option: Lingnan Tiandi restaurants for Cantonese/Shunde-style dishes; choose a calmer restaurant over queue-heavy social media shops.",
        hotel:
          "Stay option nearby: Cordis Foshan Lingnan Tiandi or Marco Polo Lingnan Tiandi Foshan for visitors who want easy walking access.",
        transit:
          "Walk from Zumiao. Keep luggage at the hotel if staying in the Lingnan Tiandi area.",
        image: "https://www.xintiandi.com/wp-content/uploads/2019/01/lingnan-foshan.png",
      },
      {
        time: "13:00",
        stop: "Nanfeng Ancient Kiln",
        plan:
          "Move to Shiwan for Nanfeng Ancient Kiln, Shiwan ceramics context, and a pottery or craft experience if advance booking is possible.",
        story:
          "The route turns from watching culture to touching it: clay, fire, workshop streets, and ceramic memory give Foshan its material voice.",
        placeDetail:
          "Gaomiao Road, Chancheng District. The kiln and surrounding creative zone work best as a 2 to 3 hour afternoon chapter.",
        meal:
          "Afternoon break: tea, light dessert, or coffee near the creative zone; keep dinner for Shunde if continuing.",
        hotel:
          "If visitors prefer a slower craft day, return to Lingnan Tiandi / Zumiao hotels after this stop instead of going to Shunde.",
        transit:
          "Taxi from Lingnan Tiandi is usually the simplest visitor-friendly transfer. Build in buffer time for workshop booking.",
        image:
          "https://commons.wikimedia.org/wiki/Special:FilePath/Nanfeng%20Kiln%2039101-Foshan%20%2849021028018%29.jpg?width=1600",
      },
      {
        time: "15:30",
        stop: "Shunde Qinghui Garden and food streets",
        plan:
          "Continue to Daliang for Qinghui Garden, then use Huagai Road or Jinbang Street for Shunde snacks and dinner.",
        story:
          "The final chapter turns craft into taste: garden pacing, milk desserts, fish, snacks, and dinner show how precision becomes hospitality.",
        placeDetail:
          "Qinghui Garden is in Daliang, Shunde. Pair it with Huagai Road Pedestrian Street or Jinbang Street for food discovery.",
        meal:
          "Food focus: double-skin milk at well-known Shunde dessert shops such as Minxin or Renxin; dinner can focus on Shunde cuisine, fish, or local snacks.",
        hotel:
          "If ending late in Shunde, choose a Daliang/Shunde hotel. If flying/train transfer is next morning, return to Foshan Chancheng or Guangzhou after dinner.",
        transit:
          "This is the longest transfer of the day. For international visitors, private car or taxi is easier than forcing multiple metro transfers.",
        image:
          "https://commons.wikimedia.org/wiki/Special:FilePath/Foshan%20Shunde%20Qinghui%20Yuan%202024-05-11%2016.03.07.jpg?width=1600",
      },
    ],
  },
  {
    slug: "drums-tea-and-tides",
    title: "Where Drums, Tea, and Tides Meet",
    culture: "Chaoshan",
    city: "Chaozhou / Shantou",
    cities: ["Chaozhou", "Shantou"],
    duration: "2 days",
    audience: "Culture and food travelers",
    summary:
      "A slow eastern Guangdong route through gongfu tea, ancestral halls, Yingge rhythm, harbor streets, and overseas memory.",
    story:
      "Chaoshan is best understood slowly. Tea sets the tempo, ancestral halls hold the memory, drums bring ritual into the street, and Shantou harbor opens the story toward migration and return.",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Opening",
        title: "Tea Before the Route Begins",
        place: "Old Chaozhou lanes",
        story: "Gongfu tea sets the pace: careful, social, and precise.",
      },
      {
        label: "Pulse",
        title: "Drums in the Street",
        place: "Yingge and temple spaces",
        story: "Ritual performance turns public space into a living archive.",
      },
      {
        label: "Tide",
        title: "Letters from the Harbor",
        place: "Shantou port memory",
        story: "The route closes with departure, return, and the overseas Chinese thread.",
      },
    ],
    itinerary: [
      {
        time: "Day 1 Morning",
        stop: "Chaozhou old lanes",
        plan: "Begin with lanes, bridges, and a gongfu tea session.",
        story: "Tea is the route grammar: careful, social, and precise.",
      },
      {
        time: "Day 1 Afternoon",
        stop: "Ancestral hall and craft stop",
        plan: "Read wood carving, temple space, and family memory.",
        story: "The cultural story moves from private family structure to public ritual.",
      },
      {
        time: "Day 2 Morning",
        stop: "Yingge or ritual performance context",
        plan: "Connect performance, rhythm, and local community identity.",
        story: "Drums turn the route from observation into energy.",
      },
      {
        time: "Day 2 Afternoon",
        stop: "Shantou harbor streets",
        plan: "End through old port streets and street food.",
        story: "The sea closes the route with departure, return, and overseas Chinese memory.",
      },
    ],
  },
  {
    slug: "letters-from-the-harbor",
    title: "Letters from the Harbor",
    culture: "Chaoshan",
    city: "Shantou",
    cities: ["Shantou"],
    duration: "1 day",
    audience: "Harbor, food, and diaspora travelers",
    summary:
      "A Shantou harbor route following old streets, overseas Chinese memory, street food, and the language of departure.",
    story:
      "This route treats the harbor as an archive. Old streets, family letters, food stalls, and port-facing neighborhoods tell a story about leaving, returning, and keeping home alive across distance.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Port",
        title: "A City Facing Outward",
        place: "Old port streets",
        story: "The harbor gives Shantou its opening direction: outward, connected, and full of departures.",
      },
      {
        label: "Letter",
        title: "Family Across the Sea",
        place: "Overseas Chinese memory stop",
        story: "Migration turns private family memory into the city strongest emotional thread.",
      },
      {
        label: "Table",
        title: "Food That Keeps Home Near",
        place: "Street food route",
        story: "The final chapter uses taste to explain continuity, memory, and return.",
      },
    ],
    itinerary: [
      {
        time: "09:30",
        stop: "Old port streets",
        plan: "Walk the harbor-facing streets and introduce treaty-port context.",
        story: "The street grid becomes a map of departure and exchange.",
      },
      {
        time: "11:00",
        stop: "Overseas Chinese memory",
        plan: "Interpret migration stories through buildings, letters, or family traces.",
        story: "The route shifts from city history to family emotion.",
      },
      {
        time: "13:00",
        stop: "Chaoshan street food",
        plan: "Use beef balls, rice rolls, or marinated dishes as edible interpretation.",
        story: "Food keeps home portable when people move across the sea.",
      },
      {
        time: "16:00",
        stop: "Seaside close",
        plan: "End near the coast with a slower reading of harbor life.",
        story: "The route closes where departure and return share the same horizon.",
      },
    ],
  },
  {
    slug: "behind-the-walled-village",
    title: "Behind the Walled Village",
    culture: "Hakka",
    city: "Meizhou",
    cities: ["Meizhou"],
    duration: "2 days",
    audience: "Slow travelers",
    summary:
      "A mountain route about migration and home, connecting Hakka walled villages, family memory, and mountain food.",
    story:
      "This route is about how movement becomes home. It starts with Hakka architecture, follows migration memory into mountain settlements, and finishes with the taste and rhythm of family life.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Opening",
        title: "A House With Many Edges",
        place: "Hakka walled village",
        story: "Architecture becomes the first storyteller: defense, family, and settlement in one form.",
      },
      {
        label: "Road",
        title: "Migration as Memory",
        place: "Mountain settlements",
        story: "The route follows movement, language, and the question of where home begins.",
      },
      {
        label: "Table",
        title: "Food as Belonging",
        place: "Hakka meal",
        story: "The final chapter turns mountain life into flavor, family, and hospitality.",
      },
    ],
    itinerary: [
      {
        time: "Day 1 Morning",
        stop: "Hakka walled village",
        plan: "Walk through architecture, courtyard life, and family structure.",
        story: "The building is the first storyteller: defense, kinship, and settlement.",
      },
      {
        time: "Day 1 Afternoon",
        stop: "Mountain settlement",
        plan: "Read dialect, clan memory, and the landscape of migration.",
        story: "The route shifts from architecture to movement.",
      },
      {
        time: "Day 2 Morning",
        stop: "Local craft or village stop",
        plan: "Meet everyday objects, tools, and village routines.",
        story: "Home is shown through repetition, not spectacle.",
      },
      {
        time: "Day 2 Afternoon",
        stop: "Meizhou local table",
        plan: "Use Hakka food to interpret mountain life.",
        story: "Food translates migration and land into everyday cultural memory.",
      },
    ],
  },
  {
    slug: "southern-sea-table",
    title: "A Southern Sea Table",
    culture: "Coastal",
    city: "Zhanjiang",
    cities: ["Zhanjiang"],
    duration: "1 day",
    audience: "Coastal explorers",
    summary:
      "A coastal route through seafood markets, volcanic shorelines, islands, and maritime life in western Guangdong.",
    story:
      "This route reads Guangdong from the sea rather than the delta. It begins in the seafood market, follows volcanic coastline, and ends with a table facing south.",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Market",
        title: "Seafood as Morning Map",
        place: "Local market",
        story: "Read the coast through what appears on the table first.",
      },
      {
        label: "Shore",
        title: "Volcanic Edges",
        place: "Coastal landscape",
        story: "The landform changes the feeling of Guangdong from delta to sea.",
      },
      {
        label: "Return",
        title: "A Table Facing South",
        place: "Seafood dinner",
        story: "The route closes with maritime life made intimate through food.",
      },
    ],
    itinerary: [
      {
        time: "09:00",
        stop: "Seafood market",
        plan: "Start with local seafood, market rhythm, and coastal vocabulary.",
        story: "The route begins with what the sea gives to the city each morning.",
      },
      {
        time: "11:00",
        stop: "Volcanic coastline",
        plan: "Visit shoreline landscapes and read the landform.",
        story: "The coast changes the visual grammar of Guangdong.",
      },
      {
        time: "14:00",
        stop: "Fishing community",
        plan: "Understand maritime work, local life, and island connections.",
        story: "Fishing life turns geography into livelihood.",
      },
      {
        time: "18:00",
        stop: "Southern sea dinner",
        plan: "Close with a seafood table.",
        story: "The route ends where culture becomes intimate: around food.",
      },
    ],
  },
  {
    slug: "red-cliffs-northern-roads",
    title: "Red Cliffs and Northern Roads",
    culture: "Mountain",
    city: "Shaoguan",
    cities: ["Shaoguan"],
    duration: "1 day",
    audience: "Landscape and slow-travel visitors",
    summary:
      "A northern route through Danxia cliffs, temples, mountain roads, and the slower edge of Guangdong.",
    story:
      "Shaoguan changes the rhythm of Guangdong. The route leaves the delta behind and moves into red cliffs, old gateways, mountain food, and the quiet geography of northern travel.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=82",
    chapters: [
      {
        label: "Cliff",
        title: "The Red Horizon",
        place: "Danxia landform",
        story: "The landscape becomes the route first narrator, dramatic but slow.",
      },
      {
        label: "Road",
        title: "A Gateway Beyond the Delta",
        place: "Northern mountain road",
        story: "The route explains Guangdong through distance, passes, and changing terrain.",
      },
      {
        label: "Pause",
        title: "Temples, Food, and Mountain Air",
        place: "Local village or temple stop",
        story: "The final chapter slows the visitor down enough to notice texture.",
      },
    ],
    itinerary: [
      {
        time: "08:30",
        stop: "Danxia landscape",
        plan: "Begin with red cliffs and a guided landscape reading.",
        story: "The cliff gives the route its color, scale, and first memory.",
      },
      {
        time: "11:30",
        stop: "Mountain road viewpoint",
        plan: "Connect old routes, northern gateways, and Guangdong beyond the delta.",
        story: "Roads make the region legible as passage rather than destination.",
      },
      {
        time: "13:00",
        stop: "Mountain lunch",
        plan: "Use local vegetables, rice noodles, or smoked specialties as interpretation.",
        story: "Food changes with altitude, distance, and climate.",
      },
      {
        time: "15:30",
        stop: "Temple or village pause",
        plan: "Close with a quiet cultural stop instead of a rushed final attraction.",
        story: "The route ends by slowing the visitor, which is Shaoguan strongest lesson.",
      },
    ],
  },
];

export function getStoryRoute(slug: string) {
  return storyRoutes.find((route) => route.slug === slug);
}
