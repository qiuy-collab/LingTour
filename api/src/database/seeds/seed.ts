import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  collectReferencedMediaFilenames,
  syncMediaLibraryRecords,
} from './media-library';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

// Helper: JSON shorthand
const j = JSON.stringify;

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
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
      community_briefs,
      user_favorites,
      events,
      home_configs,
      app_settings
    RESTART IDENTITY CASCADE;
  `);

  await dataSource.query('DELETE FROM users WHERE email <> $1', ['admin@lingtour.cn']);

  // ═══════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      'SEED_ADMIN_PASSWORD environment variable is required. ' +
      'Example: SEED_ADMIN_PASSWORD=<your-secure-password> npm run seed',
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name, status)
     VALUES ('admin@lingtour.cn', $1, 'admin', 'LingTour Admin', 'active')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, status = EXCLUDED.status;`,
    [passwordHash],
  );

  const editorPassword = process.env.SEED_EDITOR_PASSWORD;
  if (!editorPassword) {
    throw new Error(
      'SEED_EDITOR_PASSWORD environment variable is required. ' +
      'Example: SEED_EDITOR_PASSWORD=<your-secure-password> npm run seed',
    );
  }
  const editorHash = await bcrypt.hash(editorPassword, 12);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name, status)
     VALUES ('editor@lingtour.cn', $1, 'editor', 'LingTour Editor', 'active')
     ON CONFLICT (email) DO NOTHING;`,
    [editorHash],
  );

  // ═══════════════════════════════════════════════
  // CITIES (2: Zhanjiang, Chaozhou)
  // ═══════════════════════════════════════════════

  // City 1: Zhanjiang
  const zhanjiangRes = await dataSource.query(
    `INSERT INTO cities (slug, name, region_label, hero_image, hero_narrative, tags, editor_intro,
      gallery_images, food_title, food_description, food_images, adcode, published, related_city_slugs)
     VALUES ('zhanjiang', $1, $2, '/uploads/seed/zhanjiang-hero-1200.jpg', $3, $4, $5, $6, $7, $8, $9, 440800, true, $10) RETURNING id;`,
    [
      j({ en: 'Zhanjiang', zh: '湛江' }),
      j({ en: 'Southern coast', zh: '南方海岸' }),
      j({ en: 'At the southern edge of mainland China, Zhanjiang faces the South China Sea with a confidence that feels tidal rather than metropolitan.', zh: '在中国大陆最南端，湛江以一种更接近潮汐而非都市节拍的方式面向南海。' }),
      j(['Coast', 'Seafood', 'Volcanic landscape']),
      j({ en: 'Zhanjiang is best entered as a field notebook rather than a checklist: a coastal city shaped by maritime labour, black basalt landforms, and a food culture that begins at sea.', zh: '湛江最适合被当成一本田野手记来阅读：这是一座被海上劳动、黑色玄武岩地貌和饮食文化共同塑造的海岸城市。' }),
      j(['/uploads/seed/zhanjiang-hero-1200.jpg', '/uploads/seed/southern-coast-1200.jpg']),
      j({ en: 'Flavours of Zhanjiang', zh: '湛江风味' }),
      j({ en: "Zhanjiang's food is the most immediate way to understand how coastline, weather, labour, and geology are translated into daily life.", zh: '湛江的饮食是理解海岸线、天气、劳动方式和地质条件如何转译为日常生活的最直接入口。' }),
      j(['/uploads/seed/volcanic-landscape-800.jpg', '/uploads/seed/seafood-dishes-800.jpg']),
      j(['chaozhou']),
    ],
  );
  const zhanjiangId = zhanjiangRes[0].id;

  // City 2: Chaozhou
  const chaozhouRes = await dataSource.query(
    `INSERT INTO cities (slug, name, region_label, hero_image, hero_narrative, tags, editor_intro,
      gallery_images, food_title, food_description, food_images, adcode, published, related_city_slugs)
     VALUES ('chaozhou', $1, $2, '/uploads/seed/chaozhou-hero-1200.jpg', $3, $4, $5, $6, $7, $8, $9, 445102, true, $10) RETURNING id;`,
    [
      j({ en: 'Chaozhou', zh: '潮州' }),
      j({ en: 'Eastern Guangdong', zh: '粤东' }),
      j({ en: 'Chaozhou is a city where ritual and daily life have never fully separated. Tea, porcelain, opera, and food exist not as heritage categories but as living rhythms.', zh: '潮州是一座仪式与日常从未完全分离的城市。茶、瓷器、戏曲和饮食不是遗产类别，而是活着的节奏。' }),
      j(['Tea culture', 'Porcelain', 'Heritage']),
      j({ en: 'Chaozhou rewards slowness. Its culture is best understood through repetition — the same tea poured again, the same street walked twice, the same craft observed at different hours.', zh: '潮州奖赏慢下来的人。它的文化最适合通过重复来理解——同一壶茶再泡一次，同一条街再走一遍，同一门手艺在不同时段观察。' }),
      j(['/uploads/seed/chaozhou-hero-1200.jpg', '/uploads/seed/chaozhou-tea-1200.jpg']),
      j({ en: 'Chaozhou Cuisine', zh: '潮州菜' }),
      j({ en: 'Chaozhou cuisine is precise, seasonal, and deeply tied to ritual. From morning congee to evening hotpot, every meal carries centuries of refinement.', zh: '潮州菜精确、应季，与仪式深度绑定。从早粥到晚间打边炉，每一餐都承载着数百年的精炼。' }),
      j(['/uploads/seed/chaozhou-food-800.jpg', '/uploads/seed/chaozhou-tea-800.jpg']),
      j(['zhanjiang']),
    ],
  );
  const chaozhouId = chaozhouRes[0].id;

  // ═══════════════════════════════════════════════
  // CITY CULTURE SECTIONS
  // ═══════════════════════════════════════════════

  // Zhanjiang sections (3)
  await dataSource.query(
    `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order)
     VALUES
      ($1, $2, $3, '/uploads/seed/southern-coast-1200.jpg', $4, $5, '/uploads/seed/southern-coast-1200.jpg', $6, 0),
      ($1, $7, $8, '/uploads/seed/zhanjiang-hero-1200.jpg', $9, $10, '/uploads/seed/zhanjiang-hero-1200.jpg', $11, 1),
      ($1, $12, $13, '/uploads/seed/volcanic-landscape-1200.jpg', $14, $15, '/uploads/seed/volcanic-landscape-1200.jpg', $16, 2);`,
    [
      zhanjiangId,
      j({ en: 'Southern coast', zh: '南方海岸' }),
      j({ en: "Zhanjiang's coastline is long, open, and working. It shifts through harbours, mudflats, mangroves, and beaches that belong as much to fishers as to visitors.", zh: '湛江的海岸线漫长、开阔，而且仍然在工作。它在渔港、滩涂、红树林与公共海滩之间不断切换。' }),
      j({ en: 'Coastline', zh: '海岸线' }),
      j({ en: '1,243 km', zh: '1243 公里' }),
      j({ en: 'This is not a postcard coastline but a lived one: tides, labour, and the return of the sea at mealtime.', zh: '这里不是明信片海岸，而是一条被真正生活出来的海岸。' }),
      j({ en: 'Fishing communities', zh: '渔村社区' }),
      j({ en: "Fishing villages around Zhanjiang are still part of the economic and emotional engine of the region. Labour is distributed across households: some go to sea, some sort, preserve, transport, or sell.", zh: '湛江周边的渔村仍然是地区经济与情感结构的一部分。劳动被分散在家庭内部。' }),
      j({ en: 'Fishing villages', zh: '渔村' }),
      j({ en: '100+ villages', zh: '100+ 渔村' }),
      j({ en: 'What appears at dinner tonight was still moving in open water this morning.', zh: '今晚餐桌上的海鲜，今晨还在外海活动。' }),
      j({ en: 'Volcanic landscape', zh: '火山地貌' }),
      j({ en: "The Leizhou Peninsula surprises visitors because its underlying logic is volcanic rather than fluvial. Black basalt, crater lakes, and mineral-rich soils produce a landscape that feels tougher and more elemental.", zh: '雷州半岛最让初访者意外的一点，是它的底层逻辑更接近火山地貌。黑色玄武岩、玛珥湖和富含矿物的土壤让这里显得更硬朗。' }),
      j({ en: 'Volcanic cones', zh: '火山锥' }),
      j({ en: '80+', zh: '80+' }),
      j({ en: 'Geological time is not buried here; it still surfaces in farms, shorelines, and craft textures.', zh: '在这里，地质时间并没有被埋进过去，而仍然持续浮现在农田、海岸和器物纹理中。' }),
    ],
  );

  // Chaozhou sections (3)
  await dataSource.query(
    `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order)
     VALUES
      ($1, $2, $3, '/uploads/seed/chaozhou-tea-1200.jpg', $4, $5, '/uploads/seed/chaozhou-tea-1200.jpg', $6, 0),
      ($1, $7, $8, '/uploads/seed/chaozhou-hero-1200.jpg', $9, $10, '/uploads/seed/chaozhou-hero-1200.jpg', $11, 1),
      ($1, $12, $13, '/uploads/seed/chaozhou-food-800.jpg', $14, $15, '/uploads/seed/chaozhou-food-800.jpg', $16, 2);`,
    [
      chaozhouId,
      j({ en: 'Kungfu Tea', zh: '功夫茶' }),
      j({ en: 'Chaoshan Kungfu Tea is not a performance but a daily practice. The 21-step brewing ritual is how conversation, hospitality, and time itself are structured in this region.', zh: '潮汕功夫茶不是表演而是日常实践。二十一式冲泡仪式是这个地区组织对话、待客和时间本身的方式。' }),
      j({ en: 'Tea varieties', zh: '茶品种' }),
      j({ en: '100+ Dancong', zh: '100+ 单丛' }),
      j({ en: 'A cup of Kungfu Tea is not about the tea alone — it is about the pace of the afternoon.', zh: '一杯功夫茶不只关乎茶本身——它关乎整个下午的节奏。' }),
      j({ en: 'Ancient city', zh: '古城' }),
      j({ en: 'The old city of Chaozhou has been continuously inhabited for over 1,600 years. Its streets, temples, and clan halls form a living archive of Teochew culture.', zh: '潮州古城已连续有人居住超过1600年。它的街道、庙宇和宗祠构成了潮汕文化的活档案。' }),
      j({ en: 'Heritage sites', zh: '文保单位' }),
      j({ en: '700+ sites', zh: '700+ 处' }),
      j({ en: 'Every lane in the old city holds a story that is still being told.', zh: '古城的每一条巷子都有一个仍在被讲述的故事。' }),
      j({ en: 'Porcelain and craft', zh: '陶瓷与手工艺' }),
      j({ en: 'Chaozhou porcelain has been exported along maritime trade routes for centuries. Today, the craft continues in workshops where technique is passed through families.', zh: '潮州瓷器沿海上贸易路线出口了数百年。如今，这门手艺在家族传承的作坊中延续。' }),
      j({ en: 'Porcelain history', zh: '制瓷史' }),
      j({ en: '1,300+ years', zh: '1300+ 年' }),
      j({ en: 'The kiln fire has not gone out in Chaozhou for over a millennium.', zh: '潮州的窑火一千多年未曾熄灭。' }),
    ],
  );

  // ═══════════════════════════════════════════════
  // STORY ROUTES (2)
  // ═══════════════════════════════════════════════

  // Route 1: Southern Sea Table (Zhanjiang)
  const route1Res = await dataSource.query(
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, route_region_key, published)
     VALUES ('southern-sea-table', $1, 'Coastal', $2, $3, $4, $5, $6, '/uploads/seed/southern-sea-table-cover.jpg', 'southern-sea', true) RETURNING id;`,
    [
      j({ en: 'A Southern Sea Table', zh: '一张朝南的餐桌' }),
      j({ en: 'Zhanjiang', zh: '湛江' }),
      j({ en: '1 day', zh: '1 天' }),
      j({ en: 'Curious travellers', zh: '好奇旅行者' }),
      j({ en: 'A one-day route through Zhanjiang from volcanic lake to seafood dinner.', zh: '一条从火山湖到海鲜晚餐的湛江一日路线。' }),
      j({ en: 'Every stop traces back to the relationship between city and sea.', zh: '每一个站点都回到城市与海洋的关系。' }),
    ],
  );
  const route1Id = route1Res[0].id;

  // Route 1 stops (4)
  await dataSource.query(
    `INSERT INTO route_stops (route_id, sort_order, time, stop_name, story, cultural_story, details, image, lat, lng, meal, hotel, transit)
     VALUES
      ($1, 0, '08:00', $2, $3, $4, $5, '/uploads/seed/route-huguangyan.jpg', 21.147, 110.277, NULL, NULL, NULL),
      ($1, 1, '11:00', $6, $7, $8, $9, '/uploads/seed/route-dongfeng.jpg', 21.196, 110.404, NULL, NULL, NULL),
      ($1, 2, '14:00', $10, $11, $12, $13, '/uploads/seed/route-xiashan.jpg', 21.197, 110.411, NULL, NULL, NULL),
      ($1, 3, '17:30', $14, $15, $16, $17, '/uploads/seed/route-jinsha.jpg', 21.249, 110.427, $18, NULL, NULL);`,
    [
      route1Id,
      j({ en: 'Huguangyan Maar Lake', zh: '湖光岩玛珥湖' }),
      j({ en: 'Begin at Huguangyan, where a calm ring of water sits inside a volcanic crater formed 160,000 years ago.', zh: '从湖光岩开始：约16万年前形成的火山口，如今盛着一圈安静的湖水。' }),
      j({ en: 'This UNESCO geopark preserves one of China\'s best-known maar volcano landscapes.', zh: '这里是联合国教科文组织地质公园，也是中国最具代表性的玛珥火山地貌之一。' }),
      j(['UNESCO geopark crater', '2.3 km rim trail', 'Volcanic geology museum']),
      j({ en: 'Dongfeng Seafood Market', zh: '东风海鲜市场' }),
      j({ en: 'By late morning the route drops into the working pulse of the coast: foam boxes, wet concrete, shouted prices.', zh: '接近中午，路线转入真正运作中的海岸脉搏：泡沫箱、潮湿地面、此起彼伏的叫价声。' }),
      j({ en: 'Dongfeng Market is not staged for visitors. Its auction rhythm reveals the everyday system behind Zhanjiang\'s food culture.', zh: '东风海鲜市场并不是为游客设计的舞台。这里的竞价节奏直接揭示了湛江饮食文化背后的日常系统。' }),
      j(['Wholesale seafood lanes', 'Morning bidding rhythm', 'Seasonal catch hierarchy']),
      j({ en: 'Xiashan French Heritage', zh: '霞山法式遗迹' }),
      j({ en: 'In the afternoon, the route slows down in Xiashan, where older streets hold the memory of the former French leasehold.', zh: '到了下午，路线在霞山慢下来。老街仍保存着法租时期留下的痕迹。' }),
      j({ en: 'Colonial architecture has been folded into schools, shops, and daily routines here.', zh: '这里的殖民建筑已被折进学校、店铺和日常步行路径之中。' }),
      j(['Former customs routes', 'Catholic church quarter', 'Old villa streetscape']),
      j({ en: 'Jinsha Bay and Seafood Dinner', zh: '金沙湾与海鲜晚餐' }),
      j({ en: 'The route closes at Jinsha Bay, where the day resolves at the table.', zh: '路线最后在金沙湾收束，这一天最终回到餐桌上。' }),
      j({ en: 'In Zhanjiang, seafood is the edible end point of an entire coastal system.', zh: '在湛江，海鲜是整套海岸系统最终可以被吃进身体里的结果。' }),
      j(['Bayfront promenade', 'Multi-course seafood table', 'Sunset tide line']),
      j({ en: 'Seafood dinner', zh: '海鲜晚餐' }),
    ],
  );

  // Route 2: Chaoshan Tea Culture
  const route2Res = await dataSource.query(
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, route_region_key, published)
     VALUES ('chaoshan-tea-culture', $1, 'Tea', $2, $3, $4, $5, $6, '/uploads/seed/chaozhou-tea-1200.jpg', 'chaoshan-coast', true) RETURNING id;`,
    [
      j({ en: 'Chaoshan Tea Culture Route', zh: '潮汕功夫茶文化路线' }),
      j({ en: 'Chaozhou', zh: '潮州' }),
      j({ en: '2 days', zh: '2 天' }),
      j({ en: 'Tea enthusiasts & culture seekers', zh: '茶文化爱好者' }),
      j({ en: 'A two-day immersion into Chaoshan Kungfu Tea — from mountain tea gardens to the 21-step brewing ritual.', zh: '两天沉浸式体验潮汕功夫茶——从凤凰山茶园到二十一式冲泡仪式。' }),
      j({ en: 'Tea in Chaoshan is not a beverage but a social grammar — the way time, hospitality, and conversation are structured.', zh: '在潮汕，茶不是饮品而是社交语法——时间、待客和对话的组织方式。' }),
    ],
  );
  const route2Id = route2Res[0].id;

  // Route 2 stops (4)
  await dataSource.query(
    `INSERT INTO route_stops (route_id, sort_order, time, stop_name, story, cultural_story, details, image, lat, lng, meal, hotel, transit)
     VALUES
      ($1, 0, '09:00', $2, $3, $4, $5, '/uploads/seed/chaozhou-tea-1200.jpg', 23.656, 116.622, NULL, NULL, NULL),
      ($1, 1, '14:00', $6, $7, $8, $9, '/uploads/seed/chaozhou-hero-1200.jpg', 23.661, 116.638, $10, NULL, NULL),
      ($1, 2, '09:00', $11, $12, $13, $14, '/uploads/seed/chaozhou-food-800.jpg', 23.770, 116.680, NULL, NULL, NULL),
      ($1, 3, '15:00', $15, $16, $17, $18, '/uploads/seed/chaozhou-tea-800.jpg', 23.660, 116.635, $19, NULL, NULL);`,
    [
      route2Id,
      j({ en: 'Paifang Street Tea Houses', zh: '牌坊街茶铺' }),
      j({ en: 'Begin on Paifang Street, where century-old tea shops line the ancient thoroughfare beneath ornate memorial arches.', zh: '从牌坊街开始，百年茶铺在牌坊下一字排开。' }),
      j({ en: 'These tea houses are not museums — they are daily gathering points where the 21-step Kungfu Tea ritual is practiced as naturally as breathing.', zh: '这些茶铺不是博物馆——它们是日常聚集点，二十一式功夫茶仪式在这里如呼吸般自然。' }),
      j(['Century-old tea shops', 'Live brewing demonstrations', 'Dancong tasting']),
      j({ en: 'Kaiyuan Temple & Old City', zh: '开元寺与古城' }),
      j({ en: 'After tea, walk through the old city to Kaiyuan Temple, where 1,300 years of Buddhist history meets Teochew architectural craft.', zh: '品茶之后，穿过古城走到开元寺，1300年佛教历史与潮汕建筑工艺在此相遇。' }),
      j({ en: 'The temple complex shows how Chaozhou absorbed outside influences while maintaining its own aesthetic language.', zh: '寺庙群展示了潮州如何在吸收外来影响的同时保持自己的美学语言。' }),
      j(['Tang dynasty temple', 'Stone carvings', 'Courtyard meditation']),
      j({ en: 'Vegetarian lunch at temple', zh: '寺庙素斋' }),
      j({ en: 'Phoenix Mountain Tea Gardens', zh: '凤凰山茶园' }),
      j({ en: 'Day two begins with a drive up Phoenix Mountain, where Dancong tea trees grow at 600-1200m elevation in volcanic soil.', zh: '第二天从凤凰山开始，单丛茶树在600-1200米海拔的火山土壤中生长。' }),
      j({ en: 'Each ancient tea tree produces a unique flavour profile. The mountain\'s microclimate creates the conditions for over 100 named varieties.', zh: '每棵古茶树都有独特的风味。山上的微气候创造了100多个命名品种的条件。' }),
      j(['Ancient tea trees (400+ years)', 'Altitude tasting comparison', 'Tea picking experience']),
      j({ en: 'Afternoon Tea Ceremony', zh: '下午茶道体验' }),
      j({ en: 'Return to the old city for a formal tea ceremony with a master brewer, learning the complete 21-step Kungfu Tea ritual.', zh: '回到古城，跟随茶艺师体验完整的二十一式功夫茶仪式。' }),
      j({ en: 'The ceremony is not about perfection but about presence — each step teaches you to slow down and pay attention.', zh: '茶道不是关于完美而是关于在场——每一步都教你慢下来、注意当下。' }),
      j(['Full 21-step ceremony', 'Master brewer guidance', 'Tea ware appreciation']),
      j({ en: 'Tea and snacks pairing', zh: '茶配点心' }),
    ],
  );


  // Route-City Links
  await dataSource.query(
    `INSERT INTO route_city_links (route_id, city_id, sort_order) VALUES ($1, $2, 0), ($3, $4, 0);`,
    [route1Id, zhanjiangId, route2Id, chaozhouId],
  );

  // Collection 1: Coastal Life Kit (Zhanjiang)
  const coll1Res = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published)
     VALUES ('coastal-life-kit', $1, $2, 'southern-sea-table', '/uploads/seed/zhanjiang-hero-1200.jpg', $3, 0, true) RETURNING id;`,
    [
      j({ en: 'Coastal Life Kit', zh: '海岸生活套组' }),
      j({ en: 'A Southern Sea Table', zh: '一张朝南的餐桌' }),
      j({ en: 'Objects from the Zhanjiang coast: volcanic clay ceramics and maritime craft.', zh: '来自湛江海岸的器物：火山陶土器皿与海洋手作。' }),
    ],
  );
  const coll1Id = coll1Res[0].id;

  // Collection 2: Tea Culture Set (Chaozhou)
  const coll2Res = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published)
     VALUES ('tea-culture-set', $1, $2, 'chaoshan-tea-culture', '/uploads/seed/chaozhou-tea-1200.jpg', $3, 1, true) RETURNING id;`,
    [
      j({ en: 'Tea Culture Set', zh: '茶文化套组' }),
      j({ en: 'Chaoshan Tea Culture Route', zh: '潮汕功夫茶文化路线' }),
      j({ en: 'Handcrafted tea ware and Dancong tea from Chaozhou — objects that carry the ritual of Kungfu Tea.', zh: '潮州手工茶器与凤凰单丛——承载功夫茶仪式的器物。' }),
    ],
  );
  const coll2Id = coll2Res[0].id;

  // Products (2 total, 1 per collection)
  await dataSource.query(
    `INSERT INTO store_products (slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published)
     VALUES
      ('volcanic-soil-bowl', $1, $2, 32.00, 'SGD', $3, '/uploads/seed/volcanic-soil-bowl-900.jpg', $4, $5, $6, $7, $8, $9, 10, true),
      ('zhuni-teapot', $10, $11, 88.00, 'SGD', $12, '/uploads/seed/chaozhou-tea-800.jpg', $13, $14, $15, $16, $17, $18, 5, true);`,
    [
      j({ en: 'Volcanic Soil Tea Bowl', zh: '火山土茶碗' }),
      coll1Id,
      j({ en: 'Handcrafted', zh: '手工制作' }),
      j({ en: 'A bowl fired from Leizhou volcanic clay, carrying the dark mineral tones of the peninsula.', zh: '使用雷州火山陶土烧制，带着半岛深色矿物质调。' }),
      j({ en: 'Natural volcanic clay, lead-free matte glaze', zh: '天然火山陶土，无铅哑光釉' }),
      j({ en: '9cm diameter, 5cm height', zh: '直径9cm，高5cm' }),
      j({ en: 'Leizhou Peninsula, Zhanjiang', zh: '湛江·雷州半岛' }),
      j({ en: 'Hand wash only; not for microwave.', zh: '建议手洗，不建议微波。' }),
      j(['/uploads/seed/volcanic-soil-bowl-1200.jpg', '/uploads/seed/pottery-workshop-1200.jpg']),
      j({ en: 'Chaozhou Zhuni Teapot', zh: '潮州朱泥手拉壶' }),
      coll2Id,
      j({ en: 'Master crafted', zh: '大师手作' }),
      j({ en: 'A hand-pulled zhuni clay teapot from Chaozhou, designed specifically for Kungfu Tea brewing.', zh: '潮州手拉朱泥壶，专为功夫茶冲泡设计。' }),
      j({ en: 'Chaozhou zhuni clay, unglazed interior', zh: '潮州朱泥，内壁无釉' }),
      j({ en: '120ml capacity, 8cm height', zh: '容量120ml，高8cm' }),
      j({ en: 'Fengxi, Chaozhou', zh: '潮州·枫溪' }),
      j({ en: 'Season with tea before first use. Never use soap.', zh: '首次使用前用茶水养壶。切勿使用洗涤剂。' }),
      j(['/uploads/seed/chaozhou-tea-1200.jpg']),
    ],
  );

  // ═══════════════════════════════════════════════
  // INTERPRETING (2 modes, 2 profiles, 3 FAQs)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO interpreting_service_modes (sort_order, title, price, best_for, body, includes, accent, featured)
     VALUES
      (0, $1, $2, $3, $4, $5, 'light', false),
      (1, $6, $7, $8, $9, $10, 'dark', true);`,
    [
      j({ en: 'City companion interpreting', zh: '城市同行口译' }),
      j({ en: 'From RMB 680 / half day', zh: 'RMB 680 / 半天起' }),
      j({ en: 'Independent visitors', zh: '独立访客' }),
      j({ en: 'Ground support for transit, ordering, ticketing and etiquette.', zh: '提供交通、点餐、购票与礼仪支持。' }),
      j(['English support', 'Restaurant help', 'Local etiquette']),
      j({ en: 'Story route guided support', zh: '故事路线引导支持' }),
      j({ en: 'From RMB 1,280 / half day', zh: 'RMB 1,280 / 半天起' }),
      j({ en: 'Route followers', zh: '路线探索者' }),
      j({ en: 'Keep route pacing and cultural thread clear across all stops.', zh: '保障全程节奏与文化线索清晰连贯。' }),
      j(['Route pacing', 'Stop-by-stop storytelling', 'Menu help']),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreter_profiles (sort_order, name, language, focus, helps, avatar, bio, status, city)
     VALUES
      (0, $1, $2, $3, $4, '', $5, 'active', 'Chaozhou'),
      (1, $6, $7, $8, $9, '', $10, 'active', 'Zhanjiang');`,
    [
      j({ en: 'Food and Local Life Host', zh: '美食与本地生活向导' }),
      j({ en: 'English / Mandarin / Teochew', zh: '英语 / 普通话 / 潮汕话' }),
      j({ en: 'Markets, menus, tea culture, everyday interaction support.', zh: '市场、菜单、茶文化与日常互动支持。' }),
      j(['Menus', 'Tea culture', 'Market walks']),
      j({ en: 'Born in Chaozhou, specializing in food culture and tea ceremony interpretation.', zh: '潮州人，专注饮食文化和茶道口译。' }),
      j({ en: 'Study Visit Coordinator', zh: '学访协调员' }),
      j({ en: 'English / Mandarin', zh: '英语 / 普通话' }),
      j({ en: 'Schedules, check-ins, group movement control.', zh: '行程、签到与团队动线协调。' }),
      j(['Schedules', 'Check-ins', 'Group movement']),
      j({ en: 'Former university lecturer, now coordinating academic and corporate study visits.', zh: '前大学讲师，现协调学术和企业学访。' }),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreting_faqs (sort_order, question, answer, category)
     VALUES
      (0, $1, $2, 'interpreting'),
      (1, $3, $4, 'interpreting'),
      (2, $5, $6, 'interpreting');`,
    [
      j({ en: 'Is this guide service or interpreting?', zh: '这是导游还是口译服务？' }),
      j({ en: 'It combines cultural interpreting with practical travel support.', zh: '这是文化口译与行程支持的组合服务。' }),
      j({ en: 'Can I book only restaurant or transport help?', zh: '可以只预约餐厅或交通支持吗？' }),
      j({ en: 'Yes, short support is available for key moments.', zh: '可以，支持短时段关键场景服务。' }),
      j({ en: 'Must I follow a route exactly?', zh: '必须严格按路线执行吗？' }),
      j({ en: 'No, routes are starting points and can be customized.', zh: '不用，路线可按你的安排灵活调整。' }),
    ],
  );

  // ═══════════════════════════════════════════════
  // EVENTS (2)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO events (slug, title, summary, description, city, city_slug, date, end_date, tags, image, status, related_route_slugs)
     VALUES
      ('zhanjiang-coast-night', $1, $2, $3, 'Zhanjiang', 'zhanjiang', '2026-06-20', '2026-06-20', $4, '/uploads/seed/zhanjiang-hero-1200.jpg', 'published', $5),
      ('chaoshan-tea-festival', $6, $7, $8, 'Chaozhou', 'chaozhou', '2026-07-15', '2026-07-18', $9, '/uploads/seed/chaozhou-tea-1200.jpg', 'published', $10);`,
    [
      j({ en: 'Zhanjiang Coast Story Night', zh: '湛江海岸故事夜' }),
      j({ en: 'An evening gathering on maritime food and route stories.', zh: '一场围绕海洋饮食与路线故事的夜间活动。' }),
      j({ en: 'Community event with route narrators and local interpreters sharing coastal stories over seafood.', zh: '由路线讲述者与本地口译员共同参与的社区活动，在海鲜餐桌上分享海岸故事。' }),
      j(['community', 'story', 'food']),
      j(['southern-sea-table']),
      j({ en: 'Chaoshan Kungfu Tea Festival', zh: '潮汕功夫茶文化节' }),
      j({ en: 'Four days of immersive Kungfu Tea culture — from mountain gardens to master ceremonies.', zh: '四天沉浸式功夫茶文化体验——从山间茶园到大师茶道。' }),
      j({ en: 'The annual tea festival brings together tea masters, ceramic artists, and cultural interpreters for workshops, tastings, and ceremonies.', zh: '年度茶文化节汇聚茶艺大师、陶瓷艺术家和文化口译员，举办工作坊、品鉴会和茶道仪式。' }),
      j(['tea', 'culture', 'workshop']),
      j(['chaoshan-tea-culture']),
    ],
  );

  // ═══════════════════════════════════════════════
  // COMMUNITY POSTS (2) + BRIEFS (2)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO community_posts (channel, status, "user", title, excerpt, tags, image, location, route, mood, likes, comments, saves)
     VALUES
      ('FieldNotes', 'published', $1, $2, $3, $4, '/uploads/seed/volcanic-landscape-1200.jpg', 'Zhanjiang', 'southern-sea-table', 'curious', 12, 4, 6),
      ('FoodMap', 'published', $5, $6, $7, $8, '/uploads/seed/chaozhou-food-800.jpg', 'Chaozhou', 'chaoshan-tea-culture', 'warm', 89, 15, 32);`,
    [
      j({ name: 'LingTour Team', handle: 'lingtour', avatar: 'https://ui-avatars.com/api/?name=LingTour&background=random' }),
      j({ en: 'Morning auction notes', zh: '清晨拍卖现场笔记' }),
      j({ en: 'The auction rhythm explains local seafood hierarchy better than any brochure.', zh: '拍卖节奏比任何宣传册都更能解释本地海鲜层级。' }),
      j(['market', 'coast', 'seafood']),
      j({ name: '林小明', handle: 'xiaoming_lin', avatar: 'https://ui-avatars.com/api/?name=林小明&background=random' }),
      j({ en: 'Century-old tea shop on Paifang Street', zh: '牌坊街百年茶铺' }),
      j({ en: 'Found a four-generation tea shop at the corner of Paifang Street — their Dancong is all from their own garden.', zh: '在牌坊街拐角处发现一家传承四代的老茶铺，凤凰单丛都是自家茶园采摘的。' }),
      j(['tea', 'Chaozhou', 'heritage']),
    ],
  );

  // Community Briefs
  await dataSource.query(
    `INSERT INTO community_briefs (slug, title, prompt, channel, location, route, mood, sort_order, active)
     VALUES
      ('coast-morning', $1, $2, 'FieldNotes', 'Zhanjiang', 'southern-sea-table', 'curious', 0, true),
      ('tea-ritual', $3, $4, 'CultureDesk', 'Chaozhou', 'chaoshan-tea-culture', 'reflective', 1, true);`,
    [
      j({ en: 'A morning on the coast', zh: '海岸的一个清晨' }),
      j({ en: 'Describe what you saw, heard, and smelled during a morning at Zhanjiang\'s coast. Focus on the working rhythm rather than scenery.', zh: '描述你在湛江海岸的一个清晨所见、所闻、所嗅。关注劳动节奏而非风景。' }),
      j({ en: 'The tea ritual', zh: '茶的仪式' }),
      j({ en: 'Write about a moment during Kungfu Tea that changed how you think about time or attention.', zh: '写一个功夫茶过程中改变你对时间或注意力看法的瞬间。' }),
    ],
  );

  // ═══════════════════════════════════════════════
  // HOME CONFIG + APP SETTINGS
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO home_configs (
      hero, trust_metrics, entry_cards, culture_highlights, testimonials,
      featured_route_slugs, featured_product_slugs, featured_city_slugs
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    [
      j({
        title: { en: 'LingTour', zh: 'LingTour 岭途' },
        subtitle: { en: 'Story-shaped routes across Guangdong', zh: '在广东，用故事串起城市与旅行' },
        stats: [
          { title: { en: '2', zh: '2' }, description: { en: 'Cities Explored', zh: '深度探索城市' } },
          { title: { en: '2', zh: '2' }, description: { en: 'Curated Routes', zh: '精选路线' } },
          { title: { en: '2', zh: '2' }, description: { en: 'Cultural Products', zh: '文创商品' } },
          { title: { en: '2', zh: '2' }, description: { en: 'Local Interpreters', zh: '本地口译员' } },
        ],
      }),
      j([
        { value: '100%', label: { en: 'Local Team', zh: '本地团队' } },
        { value: '24/7', label: { en: 'Travel Support', zh: '旅行支持' } },
        { value: '4.9/5', label: { en: 'User Rating', zh: '用户评分' } },
      ]),
      j([
        { id: '01', title: { en: 'Culture', zh: '文化' }, body: { en: 'Read city stories behind each destination.', zh: '阅读每个目的地背后的城市故事。' }, href: '/culture' },
        { id: '02', title: { en: 'Story Routes', zh: '故事路线' }, body: { en: 'Follow one cultural thread through a city.', zh: '沿着一条文化线索探索一座城市。' }, href: '/routes' },
        { id: '03', title: { en: 'Interpreter Service', zh: '口译服务' }, body: { en: 'Book local bilingual support.', zh: '预约本地双语支持。' }, href: '/interpreting' },
        { id: '04', title: { en: 'Lingnan Store', zh: '文创商城' }, body: { en: 'Take home objects tied to stories.', zh: '带走与故事相关联的器物。' }, href: '/shop' },
      ]),
      j([
        { slug: 'zhanjiang', title: { en: 'Southern Coast', zh: '南方海岸' }, body: { en: 'Volcanic shoreline and maritime life.', zh: '火山海岸与海洋生活。' } },
        { slug: 'chaozhou', title: { en: 'Kungfu Tea', zh: '功夫茶' }, body: { en: 'A thousand years of mastery in one cup.', zh: '一杯茶里的千年功夫。' } },
      ]),
      j([
        { quote: { en: 'I left understanding why every dish mattered.', zh: '我终于明白每一道菜为何重要。' }, name: { en: 'Lina, Singapore', zh: 'Lina，新加坡' } },
        { quote: { en: 'The tea ceremony changed how I think about time.', zh: '茶道改变了我对时间的理解。' }, name: { en: 'James K., Australia', zh: 'James K.，澳大利亚' } },
      ]),
      j(['southern-sea-table', 'chaoshan-tea-culture']),
      j(['volcanic-soil-bowl', 'zhuni-teapot']),
      j(['zhanjiang', 'chaozhou']),
    ],
  );

  await dataSource.query(
    `INSERT INTO app_settings (scope, payload)
     VALUES ('default', $1)
     ON CONFLICT (scope) DO UPDATE SET payload = EXCLUDED.payload;`,
    [
      j({
        seoTitle: 'LingTour',
        seoDescription: 'Story-shaped routes across Guangdong — culture, food, and local life.',
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

  const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');
  const referencedMedia = await collectReferencedMediaFilenames(dataSource);
  await syncMediaLibraryRecords(dataSource, referencedMedia, uploadRoot);

  console.log('Seed complete. Inserted: 2 cities, 2 routes (8 stops), 2 collections (2 products), 2 events, 2 community posts, 2 briefs, 2 interpreting modes, 2 profiles, 3 FAQs, home config, app settings.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
