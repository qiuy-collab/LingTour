import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'lingtour',
    password: process.env.DB_PASSWORD ?? 'lingtour_dev',
    database: process.env.DB_DATABASE ?? 'lingtour',
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Connected to database. Reset + seed start...');

  await dataSource.query(`
    TRUNCATE TABLE
      frontend_featured,
      route_stops,
      route_city_links,
      story_routes,
      city_culture_sections,
      cities,
      store_products,
      store_collections,
      interpreting_faqs,
      interpreter_profiles,
      interpreting_service_modes,
      booking_submissions,
      orders,
      community_posts,
      events,
      home_configs,
      app_settings
    RESTART IDENTITY CASCADE;
  `);

  await dataSource.query('DELETE FROM users WHERE email <> $1', [
    'admin@lingtour.cn',
  ]);

  // --- Admin user ---
  const passwordHash = await bcrypt.hash('LingTour2026!', 12);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name, status)
     VALUES ('admin@lingtour.cn', $1, 'admin', 'LingTour Admin', 'active')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, status = EXCLUDED.status;`,
    [passwordHash],
  );

  // --- City: Zhanjiang ---
  const cityRes = await dataSource.query(
    `INSERT INTO cities (
      slug, name, region_label, hero_image, hero_narrative, tags, editor_intro,
      gallery_images, food_title, food_description, food_images, adcode, published, related_city_slugs
    ) VALUES (
      'zhanjiang', $1, $2, '/uploads/seed/zhanjiang-hero-1200.jpg',
      $3, $4, $5, $6, $7, $8, $9, 440800, true, $10
    ) RETURNING id;`,
    [
      JSON.stringify({ en: 'Zhanjiang', zh: '湛江' }),
      JSON.stringify({ en: 'Southern coast', zh: '南方海岸' }),
      JSON.stringify({
        en: 'At the southern edge of mainland China, Zhanjiang faces the South China Sea with a confidence that feels tidal rather than metropolitan. It is a city read through harbours, estuaries, volcanic soil, and dinner tables, where distance is still measured by boats, markets, and the time it takes the catch to move inland.',
        zh: '在中国大陆最南端，湛江以一种更接近潮汐而非都市节拍的方式面向南海。理解这座城市，不能只看道路和楼群，而要顺着渔港、河口、火山土壤和餐桌来读：这里的距离感，仍然和渔船、市场，以及海鲜进入城市腹地所需的时间紧密相关。',
      }),
      JSON.stringify(['Coast', 'Seafood', 'Volcanic landscape']),
      JSON.stringify({
        en: 'Zhanjiang is best entered as a field notebook rather than a checklist: a coastal city shaped by maritime labour, black basalt landforms, and a food culture that begins at sea before it reaches the table.',
        zh: '湛江最适合被当成一本田野手记来阅读，而不是一张景点清单：这是一座被海上劳动、黑色玄武岩地貌，以及"从海里开始、到餐桌完成"的饮食文化共同塑造出来的海岸城市。',
      }),
      JSON.stringify(['/uploads/seed/zhanjiang-hero-1200.jpg', '/uploads/seed/southern-coast-1200.jpg']),
      JSON.stringify({ en: 'Flavours of Zhanjiang', zh: '湛江风味' }),
      JSON.stringify({
        en: "From dawn auctions and oyster rafts to pineapple fields rooted in volcanic earth, Zhanjiang's food is not a separate theme from the city itself. It is the most immediate way to understand how coastline, weather, labour, and geology are translated into daily life.",
        zh: '从清晨拍卖场、蚝排，到扎根火山土壤的菠萝地，湛江的饮食并不是城市之外的另一套主题，而是理解这座城市最快也最直接的入口。海岸线、天气、劳动方式和地质条件，最终都会在这里被转译成日常的味觉经验。',
      }),
      JSON.stringify(['/uploads/seed/volcanic-landscape-800.jpg', '/uploads/seed/seafood-dishes-800.jpg']),
      JSON.stringify([]),
    ],
  );
  const cityId = cityRes[0].id;

  // --- City Culture Sections ---
  await dataSource.query(
    `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order)
     VALUES
      ($1, $2, $3, '/uploads/seed/southern-coast-1200.jpg', $4, $5, '/uploads/seed/southern-coast-1400.jpg', $6, 0),
      ($1, $7, $8, '/uploads/seed/zhanjiang-hero-1200.jpg', $9, $10, '/uploads/seed/zhanjiang-hero-1400.jpg', $11, 1),
      ($1, $12, $13, '/uploads/seed/volcanic-landscape-1200.jpg', $14, $15, '/uploads/seed/volcanic-landscape-1400.jpg', $16, 2);`,
    [
      cityId,
      // Section 0: Southern coast
      JSON.stringify({ en: 'Southern coast', zh: '南方海岸' }),
      JSON.stringify({
        en: "Zhanjiang’s coastline is long, open, and working. It does not perform like a manicured resort edge; instead it shifts through harbours, mudflats, mangroves, black stone outcrops, and beaches that belong as much to swimmers and fishers as to visitors. To stand here is to feel that Guangdong has already turned from river world to ocean world.\n\nThe coast also structures the city’s clock. Dawn belongs to engines leaving harbour. Mid-morning belongs to market transfer. Afternoon belongs to heat, salt wind, and the practical slowing down of the shore. By evening, the sea reappears at the table, in conversation, and in the social life of the promenade.",
        zh: '湛江的海岸线漫长、开阔，而且仍然在工作。它并不像经过精心修饰的度假海滨，而是在渔港、滩涂、红树林、黑色礁岩与公共海滩之间不断切换。站在这里，会很清楚地感到广东已经从“河流文明”转入“海洋文明”。\n\n海岸也决定着城市的时间表。清晨属于出港的引擎声，中午属于海鲜进入市场的转运，下午属于热浪、咸风和海边生活自然放慢的节奏。到了傍晚，大海又会以另一种方式重新出现：在餐桌上，在散步的人群里，也在整座海湾的社交氛围之中。',
      }),
      JSON.stringify({ en: 'Coastline', zh: '海岸线' }),
      JSON.stringify({ en: '1,243 km', zh: '1243 公里' }),
      JSON.stringify({
        en: 'This is not a postcard coastline but a lived one: tides, labour, errands, heat, wind, and the return of the sea at mealtime.',
        zh: '这里不是一条只供观看的明信片海岸，而是一条被真正生活出来的海岸：潮汐、劳动、奔忙、热气、海风，以及傍晚重新回到餐桌上的海。',
      }),
      // Section 1: Fishing communities
      JSON.stringify({ en: 'Fishing communities', zh: '渔村社区' }),
      JSON.stringify({
        en: "Fishing villages around Zhanjiang are not heritage backdrops. They are still part of the economic and emotional engine of the region. Labour is distributed across households: some go to sea, some sort, preserve, transport, or sell. Knowledge is equally distributed, embedded in weather reading, fish names, auction timing, and the unwritten etiquette of the harbour.\n\nTo walk through these communities is to understand that seafood here is not simply an ingredient category. It is a social system held together by kinship, seasonality, and practical memory. Even when younger generations leave, the coast continues to shape language, mealtime expectations, and the city’s sense of self.",
        zh: '湛江周边的渔村并不是“供观看的传统风貌”，而仍然是地区经济与情感结构的一部分。劳动被分散在家庭内部：有人出海，有人分拣、腌晒、运输或售卖。知识也是如此分布的，它藏在看天气的方法、鱼名的辨认、拍卖时间点，以及港口里不成文的协作礼仪之中。\n\n走进这些社区后会明白，在这里海鲜并不只是一个食材类别，而是一整套由亲缘、季节性和生活记忆维系起来的社会系统。即便年轻人不断流动离开，海岸依然在塑造语言、饭桌预期，以及整座城市对自己的认知方式。',
      }),
      JSON.stringify({ en: 'Fishing villages', zh: '渔村' }),
      JSON.stringify({ en: '100+ villages', zh: '100+ 渔村' }),
      JSON.stringify({
        en: 'What appears at dinner tonight was still moving in open water this morning; that immediacy is the hidden grammar of coastal life here.',
        zh: '今晚餐桌上的海鲜，今晨还在外海活动；这种从海到桌的即时性，正是这里海岸生活最隐秘也最核心的语法。',
      }),
      // Section 2: Volcanic landscape
      JSON.stringify({ en: 'Volcanic landscape', zh: '火山地貌' }),
      JSON.stringify({
        en: "The Leizhou Peninsula surprises many first-time visitors because its underlying logic is volcanic rather than fluvial. Black basalt, crater lakes, and mineral-rich soils interrupt the expected image of humid South China and produce a landscape that feels tougher, darker, and more elemental than much of the province.\n\nThat geology is not abstract. It shapes cultivation, building materials, settlement patterns, and even the tactile language of local craft. The same volcanic ground that supports pineapples and sugarcane also feeds the clay traditions, textures, and color palette that recur across daily objects and regional foodways.",
        zh: '雷州半岛最让初访者意外的一点，是它的底层逻辑更接近火山地貌，而不是典型南方水网。黑色玄武岩、玛珥湖和富含矿物的土壤，打断了人们对华南湿润景观的惯常想象，也让这里显得更硬朗、更深色、更接近地质本体。\n\n而这种地质条件并不是抽象背景。它会影响耕作方式、建筑材料、聚落分布，甚至本地手工器物的触感与色调。支撑菠萝、甘蔗和热带作物生长的，正是同一片火山土地；而后来出现在陶土器皿与地方饮食里的许多质地，也都能追溯到这里。',
      }),
      JSON.stringify({ en: 'Volcanic cones', zh: '火山锥' }),
      JSON.stringify({ en: '80+', zh: '80+' }),
      JSON.stringify({
        en: 'Geological time is not buried here; it still surfaces in farms, shorelines, craft textures, and the way the peninsula feeds itself.',
        zh: '在这里，地质时间并没有被埋进过去，而仍然持续浮现在农田、海岸、器物纹理，以及半岛养活自身的方式之中。',
      }),
    ],
  );

  // --- Story Route ---
  const routeRes = await dataSource.query(
    `INSERT INTO story_routes (
      slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published
    ) VALUES (
      'southern-sea-table', $1, 'Coastal', $2, $3, $4, $5, $6,
      '/uploads/seed/southern-sea-table-cover.jpg', true
    ) RETURNING id;`,
    [
      JSON.stringify({ en: 'A Southern Sea Table', zh: '一张朝南的餐桌' }),
      JSON.stringify({ en: 'Zhanjiang', zh: '湛江' }),
      JSON.stringify({ en: '1 day', zh: '1 天' }),
      JSON.stringify({ en: 'Curious travellers', zh: '好奇旅行者' }),
      JSON.stringify({
        en: 'A one-day route through Zhanjiang from volcanic lake to seafood dinner.',
        zh: '一条从火山湖到海鲜晚餐的湛江一日路线。',
      }),
      JSON.stringify({
        en: 'Every stop traces back to the relationship between city and sea.',
        zh: '每一个站点都回到城市与海洋的关系。',
      }),
    ],
  );
  const routeId = routeRes[0].id;

  // --- Route Stops ---
  await dataSource.query(
    `INSERT INTO route_stops (
      route_id, sort_order, time, stop_name, story, cultural_story, details, image, lat, lng, meal, hotel, transit
    ) VALUES
      ($1, 0, '08:00', $2, $3, $4, $5, '/uploads/seed/route-huguangyan.jpg', 21.147, 110.277, NULL, NULL, NULL),
      ($1, 1, '11:00', $6, $7, $8, $9, '/uploads/seed/route-dongfeng.jpg', 21.196, 110.404, NULL, NULL, NULL),
      ($1, 2, '14:00', $10, $11, $12, $13, '/uploads/seed/route-xiashan.jpg', 21.197, 110.411, NULL, NULL, NULL),
      ($1, 3, '17:30', $14, $15, $16, $17, '/uploads/seed/route-jinsha.jpg', 21.249, 110.427, $18, NULL, NULL);`,
    [
      routeId,
      // Stop 0: Huguangyan
      JSON.stringify({ en: 'Huguangyan Maar Lake', zh: '湖光岩玛珥湖' }),
      JSON.stringify({
        en: 'Begin the route at Huguangyan, where a calm ring of water sits inside a volcanic crater formed roughly 160,000 years ago. The morning air is cool, the path still quiet, and the lake reads less like a scenic stop than an opening chapter about how geology shapes everything that follows on the peninsula.',
        zh: '从湖光岩开始这条路线：约 16 万年前形成的火山口，如今盛着一圈安静的湖水。清晨的空气偏凉，步道还没有完全热闹起来，这里不像普通景点，更像是整条路线的第一章，提醒你雷州半岛之后看到的一切，都和这片火山地质有关。',
      }),
      JSON.stringify({
        en: "This UNESCO geopark preserves one of China's best-known maar volcano landscapes. The lake, the crater rim, and the surrounding vegetation together explain why local farming, settlement, and even tableware traditions grew out of volcanic ground rather than river plain culture.",
        zh: '这里是联合国教科文组织地质公园，也是中国最具代表性的玛珥火山地貌之一。湖面、环形火山口和周边植被共同说明：本地农业、聚落分布，甚至后来看到的陶土器物传统，都并非生长在普通平原文化里，而是建立在火山土地之上。',
      }),
      JSON.stringify(['UNESCO geopark crater', '2.3 km rim trail', 'Volcanic geology museum']),
      // Stop 1: Dongfeng
      JSON.stringify({ en: 'Dongfeng Seafood Market', zh: '东风海鲜市场' }),
      JSON.stringify({
        en: 'By late morning the route drops into the working pulse of the coast: foam boxes, wet concrete, shouted prices, and seafood still carrying the temperature of the boat. This is where the abstract idea of “fresh catch” becomes visible as labor, timing, and local knowledge.',
        zh: '接近中午，路线转入真正运作中的海岸脉搏：泡沫箱、潮湿地面、此起彼伏的叫价声，以及还带着船上温度的海鲜。到了这里，"新鲜渔获"不再只是一个抽象概念，而是劳动、时机和本地经验一起构成的现实现场。',
      }),
      JSON.stringify({
        en: "Dongfeng Market is not staged for visitors. Its auction rhythm, seafood hierarchy, and bargaining dialect reveal the everyday system behind Zhanjiang's food culture, showing how harbour logistics feed directly into family meals, restaurants, and the city's sense of abundance.",
        zh: '东风海鲜市场并不是为游客设计的舞台。这里的竞价节奏、海产等级和讨价还价时使用的方言，直接揭示了湛江饮食文化背后的日常系统，也让人看到渔港物流如何一路进入家庭餐桌、酒楼后厨和城市对"丰盛"的理解。',
      }),
      JSON.stringify(['Wholesale seafood lanes', 'Morning bidding rhythm', 'Seasonal catch hierarchy']),
      // Stop 2: Xiashan
      JSON.stringify({ en: 'Xiashan French Heritage', zh: '霞山法式遗迹' }),
      JSON.stringify({
        en: 'In the afternoon, the route slows down in Xiashan, where older streets, shutters, arcades, and church facades hold the memory of the former French leasehold. It is a quieter stop, but one that changes the reading of the city from purely coastal to layered, negotiated, and historical.',
        zh: '到了下午，路线在霞山慢下来。老街、百叶窗、骑楼和教堂立面仍保存着法租时期留下的痕迹。这里的节奏更安静，却让整座城市的阅读方式发生变化：湛江不再只是海边城市，也是一座带着历史叠层、不断被协商和改写的城市。',
      }),
      JSON.stringify({
        en: 'Colonial architecture does not sit apart from local life here; it has been folded into schools, shops, prayer spaces, and daily routines. Walking this district helps connect maritime trade, foreign presence, and neighborhood memory into the broader story of modern Zhanjiang.',
        zh: '这里的殖民建筑并没有和本地生活分隔开来，而是被折进学校、店铺、礼拜空间和日常步行路径之中。走过这一段街区，可以把海上贸易、外来势力和社区记忆串联起来，理解现代湛江是如何形成的。',
      }),
      JSON.stringify(['Former customs routes', 'Catholic church quarter', 'Old villa streetscape']),
      // Stop 3: Jinsha Bay
      JSON.stringify({ en: 'Jinsha Bay and Seafood Dinner', zh: '金沙湾与海鲜晚餐' }),
      JSON.stringify({
        en: 'The route closes at Jinsha Bay, where the coastline opens up again and the day resolves at the table. After geology, market labor, and layered city history, dinner turns those fragments into something immediate: taste, pacing, conversation, and the sea just beyond the lights.',
        zh: '路线最后在金沙湾收束，海岸线重新打开，而这一天也最终回到餐桌上。经历了火山地貌、市场劳动和城市历史层层铺陈之后，晚餐把这些线索重新变成最直接的感受：味道、上菜节奏、同行者的交谈，以及灯光之外仍在起伏的海面。',
      }),
      JSON.stringify({
        en: 'This final stop is more than a scenic dinner. In Zhanjiang, seafood is the edible end point of an entire coastal system, and the evening meal becomes the most human way to understand how route, resource, and everyday life meet at one table.',
        zh: '这一站不只是"看海吃饭"的景观点缀。在湛江，海鲜是整套海岸系统最终可以被吃进身体里的结果，因此傍晚这一餐，也成了理解路线、资源与日常生活如何在同一张桌上相遇的最有人情味的方式。',
      }),
      JSON.stringify(['Bayfront promenade', 'Multi-course seafood table', 'Sunset tide line']),
      JSON.stringify({ en: 'Seafood dinner', zh: '海鲜晚餐' }),
    ],
  );

  // --- Route City Link ---
  await dataSource.query(
    'INSERT INTO route_city_links (route_id, city_id, sort_order) VALUES ($1, $2, 0)',
    [routeId, cityId],
  );

  // --- Store Collection ---
  const collectionRes = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published)
     VALUES ('coastal-life-kit', $1, $2, 'southern-sea-table', '/uploads/seed/zhanjiang-hero-1400-shop.jpg', $3, 0, true)
     RETURNING id;`,
    [
      JSON.stringify({ en: 'Coastal Life Kit', zh: '海岸生活套组' }),
      JSON.stringify({ en: 'A Southern Sea Table', zh: '一张朝南的餐桌' }),
      JSON.stringify({
        en: 'Objects from the Zhanjiang coast: volcanic clay ceramics and maritime craft.',
        zh: '来自湛江海岸的器物：火山陶土器皿与海洋手作。',
      }),
    ],
  );
  const collectionId = collectionRes[0].id;

  // --- Store Product ---
  await dataSource.query(
    `INSERT INTO store_products (
      slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published
    ) VALUES (
      'volcanic-soil-bowl', $1, $2, 32.00, 'SGD', $3,
      '/uploads/seed/volcanic-soil-bowl-900.jpg',
      $4, $5, $6, $7, $8, $9, 10, true
    );`,
    [
      JSON.stringify({ en: 'Volcanic Soil Tea Bowl', zh: '火山土茶碗' }),
      collectionId,
      JSON.stringify({ en: 'Handcrafted', zh: '手工制作' }),
      JSON.stringify({
        en: 'A bowl fired from Leizhou volcanic clay.',
        zh: '使用雷州火山陶土烧制。',
      }),
      JSON.stringify({
        en: 'Natural volcanic clay, lead-free matte glaze',
        zh: '天然火山陶土，无铅哑光釉',
      }),
      JSON.stringify({ en: '9cm diameter, 5cm height', zh: '直径9cm，高5cm' }),
      JSON.stringify({ en: 'Leizhou Peninsula, Zhanjiang', zh: '湛江·雷州半岛' }),
      JSON.stringify({
        en: 'Hand wash only; not for microwave.',
        zh: '建议手洗，不建议微波。',
      }),
      JSON.stringify(['/uploads/seed/volcanic-soil-bowl-1200.jpg', '/uploads/seed/pottery-workshop-1200.jpg']),
    ],
  );

  // --- Interpreting Service Modes ---
  await dataSource.query(
    `INSERT INTO interpreting_service_modes (sort_order, title, price, best_for, body, includes, accent, featured)
     VALUES
      (0, $1, $2, $3, $4, $5, 'light', false),
      (1, $6, $7, $8, $9, $10, 'dark', true),
      (2, $11, $12, $13, $14, $15, 'light', false);`,
    [
      JSON.stringify({ en: 'City companion interpreting', zh: '城市同行口译' }),
      JSON.stringify({ en: 'From RMB 680 / half day', zh: 'RMB 680 / 半天起' }),
      JSON.stringify({ en: 'Independent visitors', zh: '独立访客' }),
      JSON.stringify({
        en: 'Ground support for transit, ordering, ticketing and etiquette.',
        zh: '提供交通、点餐、购票与礼仪支持。',
      }),
      JSON.stringify(['English support', 'Restaurant help', 'Local etiquette']),
      JSON.stringify({ en: 'Story route guided support', zh: '故事路线引导支持' }),
      JSON.stringify({ en: 'From RMB 1,280 / half day', zh: 'RMB 1,280 / 半天起' }),
      JSON.stringify({ en: 'Route followers', zh: '路线探索者' }),
      JSON.stringify({
        en: 'Keep route pacing and cultural thread clear across all stops.',
        zh: '保障全程节奏与文化线索清晰连贯。',
      }),
      JSON.stringify(['Route pacing', 'Stop-by-stop storytelling', 'Menu help']),
      JSON.stringify({ en: 'Group and study visit', zh: '团体学访' }),
      JSON.stringify({ en: 'Custom pricing', zh: '定制报价' }),
      JSON.stringify({ en: 'Academic and corporate groups', zh: '学术及企业团体' }),
      JSON.stringify({
        en: 'Bilingual coordination for multi-stop visits and workshops.',
        zh: '为多站点学访/活动提供双语协调。',
      }),
      JSON.stringify(['Pre-trip planning', 'Group coordination', 'Workshop support']),
    ],
  );

  // --- Interpreter Profiles ---
  await dataSource.query(
    `INSERT INTO interpreter_profiles (sort_order, name, language, focus, helps, avatar, bio, status, city)
     VALUES
      (0, $1, $2, $3, $4, '', NULL, 'pending_review', ''),
      (1, $5, $6, $7, $8, '', NULL, 'pending_review', ''),
      (2, $9, $10, $11, $12, '', NULL, 'pending_review', '');`,
    [
      JSON.stringify({ en: 'Culture Route Lead', zh: '文化路线领队' }),
      JSON.stringify({ en: 'English / Mandarin / Cantonese', zh: '英语 / 普通话 / 粤语' }),
      JSON.stringify({
        en: 'History, neighbourhood reading, food context, route coherence.',
        zh: '城市史、街区解读、饮食背景与路线连贯性。',
      }),
      JSON.stringify(['Museum visits', 'Historic streets', 'Route pacing']),
      JSON.stringify({ en: 'Food and Local Life Host', zh: '美食与本地生活向导' }),
      JSON.stringify({ en: 'English / Mandarin', zh: '英语 / 普通话' }),
      JSON.stringify({
        en: 'Markets, menus, tea culture, everyday interaction support.',
        zh: '市场、菜单、茶文化与日常互动支持。',
      }),
      JSON.stringify(['Menus', 'Tea culture', 'Market walks']),
      JSON.stringify({ en: 'Study Visit Coordinator', zh: '学访协调员' }),
      JSON.stringify({ en: 'English / Mandarin', zh: '英语 / 普通话' }),
      JSON.stringify({
        en: 'Schedules, check-ins, group movement control.',
        zh: '行程、签到与团队动线协调。',
      }),
      JSON.stringify(['Schedules', 'Check-ins', 'Group movement']),
    ],
  );

  // --- Interpreting FAQs ---
  await dataSource.query(
    `INSERT INTO interpreting_faqs (sort_order, question, answer, category)
     VALUES
      (0, $1, $2, 'interpreting'),
      (1, $3, $4, 'interpreting'),
      (2, $5, $6, 'interpreting'),
      (3, $7, $8, 'interpreting');`,
    [
      JSON.stringify({ en: 'Is this guide service or interpreting?', zh: '这是导游还是口译服务？' }),
      JSON.stringify({
        en: 'It combines cultural interpreting with practical travel support.',
        zh: '这是文化口译与行程支持的组合服务。',
      }),
      JSON.stringify({ en: 'Can I book only restaurant or transport help?', zh: '可以只预约餐厅或交通支持吗？' }),
      JSON.stringify({
        en: 'Yes, short support is available for key moments.',
        zh: '可以，支持短时段关键场景服务。',
      }),
      JSON.stringify({ en: 'Must I follow a route exactly?', zh: '必须严格按路线执行吗？' }),
      JSON.stringify({
        en: 'No, routes are starting points and can be customized.',
        zh: '不用，路线可按你的安排灵活调整。',
      }),
      JSON.stringify({ en: 'How is this different from a generic translator?', zh: '与普通翻译有何不同？' }),
      JSON.stringify({
        en: 'You also get local pacing, etiquette and route logic.',
        zh: '除了语言，还提供本地节奏、礼仪与路线逻辑。',
      }),
    ],
  );

  // --- Events ---
  await dataSource.query(
    `INSERT INTO events (
      slug, title, summary, description, city, city_slug, date, end_date, tags, image, status, related_route_slugs
    ) VALUES
      ('zhanjiang-coast-night', $1, $2, $3, 'Zhanjiang', 'zhanjiang', '2026-06-20', '2026-06-20', $4, '/uploads/seed/zhanjiang-hero-1200.jpg', 'published', $5);`,
    [
      JSON.stringify({ en: 'Zhanjiang Coast Story Night', zh: '湛江海岸故事夜' }),
      JSON.stringify({
        en: 'An evening gathering on maritime food and route stories.',
        zh: '一场围绕海洋饮食与路线故事的夜间活动。',
      }),
      JSON.stringify({
        en: 'Community event with route narrators and local interpreters.',
        zh: '由路线讲述者与本地口译员共同参与的社区活动。',
      }),
      JSON.stringify(['community', 'story', 'food']),
      JSON.stringify(['southern-sea-table']),
    ],
  );

  // --- Community Posts ---
  await dataSource.query(
    `INSERT INTO community_posts (
      channel, status, "user", title, excerpt, tags, image, location, route, mood, likes, comments, saves
    ) VALUES
      ('field-notes', 'published', $1, $2, $3, $4, '/uploads/seed/volcanic-landscape-1200.jpg', 'Zhanjiang', 'southern-sea-table', 'curious', 12, 4, 6);`,
    [
      JSON.stringify({ name: 'LingTour Team', avatar: '' }),
      JSON.stringify({ en: 'Morning auction notes', zh: '清晨拍卖现场笔记' }),
      JSON.stringify({
        en: 'The auction rhythm explains local seafood hierarchy better than any brochure.',
        zh: '拍卖节奏比任何宣传册都更能解释本地海鲜层级。',
      }),
      JSON.stringify(['market', 'coast']),
    ],
  );

  // --- Home Config ---
  await dataSource.query(
    `INSERT INTO home_configs (
      hero, trust_metrics, entry_cards, culture_highlights, testimonials,
      featured_route_slugs, featured_product_slugs, featured_city_slugs
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    [
      JSON.stringify({
        title: { en: 'LingTour', zh: 'LingTour 岭途' },
        subtitle: { en: 'Story-shaped routes across Guangdong', zh: '在广东，用故事串起城市与旅行' },
      }),
      JSON.stringify([
        { value: '1', label: { en: 'Featured city', zh: '精选城市' } },
        { value: '1', label: { en: 'Story route', zh: '故事路线' } },
        { value: '1', label: { en: 'Cultural collection', zh: '文化商品系列' } },
      ]),
      JSON.stringify([
        { id: '01', title: { en: 'Culture', zh: '文化' }, body: { en: 'Read city stories behind each destination.', zh: '阅读每个目的地背后的城市故事。' }, href: '/culture' },
        { id: '02', title: { en: 'Story Routes', zh: '故事路线' }, body: { en: 'Follow one cultural thread through a city.', zh: '沿着一条文化线索探索一座城市。' }, href: '/routes' },
        { id: '03', title: { en: 'Interpreter Service', zh: '口译服务' }, body: { en: 'Book local bilingual support.', zh: '预约本地双语支持。' }, href: '/interpreting' },
        { id: '04', title: { en: 'Lingnan Store', zh: '文创商城' }, body: { en: 'Take home objects tied to stories.', zh: '带走与故事相关联的器物。' }, href: '/shop' },
      ]),
      JSON.stringify([
        { slug: 'zhanjiang', title: { en: 'Southern Coast', zh: '南方海岸' }, body: { en: 'Volcanic shoreline and maritime life.', zh: '火山海岸与海洋生活。' } },
      ]),
      JSON.stringify([
        { quote: { en: 'I left understanding why every dish mattered.', zh: '我终于明白每一道菜为何重要。' }, name: { en: 'Lina, Singapore', zh: 'Lina，新加坡' } },
        { quote: { en: 'The interpreter explained the market like a living classroom.', zh: '口译员把市场讲成了一堂活课。' }, name: { en: 'Marcus, UK', zh: 'Marcus，英国' } },
      ]),
      JSON.stringify(['southern-sea-table']),
      JSON.stringify(['volcanic-soil-bowl']),
      JSON.stringify(['zhanjiang']),
    ],
  );

  // --- App Settings ---
  await dataSource.query(
    `INSERT INTO app_settings (scope, payload)
     VALUES ('default', $1)
     ON CONFLICT (scope) DO UPDATE SET payload = EXCLUDED.payload;`,
    [
      JSON.stringify({
        seoTitle: 'LingTour',
        seoDescription: 'LingTour public site settings',
        enableMarkdownEditor: true,
        pageTitleFontSize: 20,
        sectionTitleFontSize: 15,
        bodyFontSize: 14,
        hintFontSize: 12,
        homeModules: {
          useHomeConfigApi: true,
          useSettingsApi: true,
        },
      }),
    ],
  );

  console.log('Seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
