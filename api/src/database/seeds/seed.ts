import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

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
  // CITIES (3: Zhanjiang, Chaozhou, Guangzhou)
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
      j(['chaozhou', 'guangzhou']),
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
      j(['zhanjiang', 'guangzhou']),
    ],
  );
  const chaozhouId = chaozhouRes[0].id;

  // City 3: Guangzhou
  const guangzhouRes = await dataSource.query(
    `INSERT INTO cities (slug, name, region_label, hero_image, hero_narrative, tags, editor_intro,
      gallery_images, food_title, food_description, food_images, adcode, published, related_city_slugs)
     VALUES ('guangzhou', $1, $2, '/uploads/seed/guangzhou-hero-1200.jpg', $3, $4, $5, $6, $7, $8, $9, 440100, true, $10) RETURNING id;`,
    [
      j({ en: 'Guangzhou', zh: '广州' }),
      j({ en: 'Pearl River Delta', zh: '珠三角' }),
      j({ en: 'Guangzhou is a city that has traded with the world for two thousand years. Its culture is layered, pragmatic, and expressed most clearly through food, architecture, and the rhythm of its neighbourhoods.', zh: '广州是一座与世界贸易了两千年的城市。它的文化是层叠的、务实的，最清晰地通过饮食、建筑和街区节奏来表达。' }),
      j(['Dim sum', 'Qilou', 'Cantonese opera']),
      j({ en: 'Guangzhou does not announce itself — it reveals itself through morning tea, evening walks, and the slow accumulation of neighbourhood knowledge.', zh: '广州不会自我宣告——它通过早茶、傍晚散步和街区知识的缓慢积累来展现自己。' }),
      j(['/uploads/seed/guangzhou-hero-1200.jpg', '/uploads/seed/guangzhou-qilou-1200.jpg']),
      j({ en: 'Cantonese Cuisine', zh: '粤菜' }),
      j({ en: 'Cantonese cuisine is the art of restraint: fresh ingredients, minimal seasoning, and technique that lets the material speak. Dim sum is its most famous expression, but the real depth lies in home cooking and market meals.', zh: '粤菜是克制的艺术：新鲜食材、极简调味、让材料自己说话的技法。点心是最著名的表达，但真正的深度在家常菜和市场餐食中。' }),
      j(['/uploads/seed/guangzhou-dimsum-800.jpg', '/uploads/seed/guangzhou-market-800.jpg']),
      j(['chaozhou', 'zhanjiang']),
    ],
  );
  const guangzhouId = guangzhouRes[0].id;

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

  // Guangzhou sections (3)
  await dataSource.query(
    `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order)
     VALUES
      ($1, $2, $3, '/uploads/seed/guangzhou-qilou-1200.jpg', $4, $5, '/uploads/seed/guangzhou-qilou-1200.jpg', $6, 0),
      ($1, $7, $8, '/uploads/seed/guangzhou-hero-1200.jpg', $9, $10, '/uploads/seed/guangzhou-hero-1200.jpg', $11, 1),
      ($1, $12, $13, '/uploads/seed/guangzhou-dimsum-800.jpg', $14, $15, '/uploads/seed/guangzhou-dimsum-800.jpg', $16, 2);`,
    [
      guangzhouId,
      j({ en: 'Qilou architecture', zh: '骑楼建筑' }),
      j({ en: 'The arcaded shophouses of Guangzhou are not just architectural heritage — they are a spatial logic born from subtropical rain, street commerce, and the pragmatism of a trading city.', zh: '广州的骑楼不只是建筑遗产——它们是亚热带雨水、街头商业和贸易城市务实精神共同催生的空间逻辑。' }),
      j({ en: 'Qilou streets', zh: '骑楼街' }),
      j({ en: '26 km preserved', zh: '26 公里保护' }),
      j({ en: 'Under the arcade, rain and commerce coexist — this is Guangzhou in one image.', zh: '骑楼之下，雨水与商业共存——这就是广州的一幅缩影。' }),
      j({ en: 'Morning tea culture', zh: '早茶文化' }),
      j({ en: 'Yum cha is not breakfast — it is a social institution. Families, business partners, and neighbours gather over dim sum to exchange news, negotiate, and simply be together.', zh: '饮茶不是早餐——它是一种社会制度。家人、生意伙伴和邻居围坐点心桌前交换消息、谈判，或只是在一起。' }),
      j({ en: 'Dim sum varieties', zh: '点心品种' }),
      j({ en: '1,000+', zh: '1000+' }),
      j({ en: 'The teahouse is where Guangzhou does its real business — over siu mai and har gow.', zh: '茶楼才是广州真正做生意的地方——在烧卖和虾饺之间。' }),
      j({ en: 'Pearl River life', zh: '珠江生活' }),
      j({ en: 'The Pearl River is not just geography — it is the organizing principle of the city. Trade, leisure, food, and memory all flow along its banks.', zh: '珠江不只是地理——它是城市的组织原则。贸易、休闲、饮食和记忆都沿着它的河岸流动。' }),
      j({ en: 'River length (city)', zh: '城区河段' }),
      j({ en: '70+ km', zh: '70+ 公里' }),
      j({ en: 'Follow the river and you follow the story of Guangzhou itself.', zh: '沿着珠江走，就是沿着广州的故事走。' }),
    ],
  );

  // ═══════════════════════════════════════════════
  // STORY ROUTES (3)
  // ═══════════════════════════════════════════════

  // Route 1: Southern Sea Table (Zhanjiang)
  const route1Res = await dataSource.query(
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published)
     VALUES ('southern-sea-table', $1, 'Coastal', $2, $3, $4, $5, $6, '/uploads/seed/southern-sea-table-cover.jpg', true) RETURNING id;`,
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
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published)
     VALUES ('chaoshan-tea-culture', $1, 'Tea', $2, $3, $4, $5, $6, '/uploads/seed/chaozhou-tea-1200.jpg', true) RETURNING id;`,
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

  // Route 3: Guangzhou Culture Walk
  const route3Res = await dataSource.query(
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published)
     VALUES ('guangzhou-culture-walk', $1, 'Urban', $2, $3, $4, $5, $6, '/uploads/seed/guangzhou-hero-1200.jpg', true) RETURNING id;`,
    [
      j({ en: 'Guangzhou Culture Walk', zh: '广州文化漫步' }),
      j({ en: 'Guangzhou', zh: '广州' }),
      j({ en: '1 day', zh: '1 天' }),
      j({ en: 'Architecture & food lovers', zh: '建筑与美食爱好者' }),
      j({ en: 'A day walking through Guangzhou\'s layered history — from morning dim sum to evening river promenade.', zh: '一天走过广州的层叠历史——从早茶到傍晚珠江漫步。' }),
      j({ en: 'Guangzhou reveals itself through its neighbourhoods: each district carries a different era, a different trade, a different rhythm.', zh: '广州通过街区展现自己：每个区域承载着不同的时代、不同的贸易、不同的节奏。' }),
    ],
  );
  const route3Id = route3Res[0].id;

  // Route 3 stops (4)
  await dataSource.query(
    `INSERT INTO route_stops (route_id, sort_order, time, stop_name, story, cultural_story, details, image, lat, lng, meal, hotel, transit)
     VALUES
      ($1, 0, '07:30', $2, $3, $4, $5, '/uploads/seed/guangzhou-dimsum-800.jpg', 23.129, 113.264, $6, NULL, NULL),
      ($1, 1, '10:00', $7, $8, $9, $10, '/uploads/seed/guangzhou-qilou-1200.jpg', 23.120, 113.250, NULL, NULL, NULL),
      ($1, 2, '14:00', $11, $12, $13, $14, '/uploads/seed/guangzhou-hero-1200.jpg', 23.130, 113.260, NULL, NULL, NULL),
      ($1, 3, '17:00', $15, $16, $17, $18, '/uploads/seed/guangzhou-market-800.jpg', 23.112, 113.252, $19, NULL, NULL);`,
    [
      route3Id,
      j({ en: 'Morning Dim Sum', zh: '早茶' }),
      j({ en: 'Start the day as Guangzhou does — at a teahouse. Yum cha is not just breakfast but a social institution.', zh: '像广州人一样开始这一天——在茶楼。饮茶不只是早餐，而是一种社会制度。' }),
      j({ en: 'The teahouse hierarchy, ordering etiquette, and pace of service all encode Cantonese social values.', zh: '茶楼的等级、点单礼仪和上菜节奏都编码着粤式社交价值观。' }),
      j(['Traditional teahouse', 'Dim sum ordering ritual', 'Tea selection guide']),
      j({ en: 'Dim sum breakfast', zh: '点心早餐' }),
      j({ en: 'Enning Road Qilou District', zh: '恩宁路骑楼区' }),
      j({ en: 'Walk through Enning Road, where Guangzhou\'s longest stretch of preserved qilou (arcaded shophouses) tells the story of early 20th century commerce.', zh: '穿过恩宁路，广州最长的骑楼保护街区讲述着20世纪初的商业故事。' }),
      j({ en: 'Qilou architecture emerged from the intersection of Cantonese pragmatism, Southeast Asian influence, and subtropical climate adaptation.', zh: '骑楼建筑诞生于粤式务实精神、东南亚影响和亚热带气候适应的交汇处。' }),
      j(['Yongqing Fang creative quarter', 'Cantonese opera museum', 'Bruce Lee ancestral home']),
      j({ en: 'Chen Clan Academy', zh: '陈家祠' }),
      j({ en: 'The Chen Clan Academy is Lingnan decorative arts at their most concentrated — stone carving, wood carving, brick carving, pottery, and iron casting in one complex.', zh: '陈家祠是岭南装饰艺术最集中的展现——石雕、木雕、砖雕、陶塑和铁铸汇于一处。' }),
      j({ en: 'Built in 1894 as a combined ancestral temple and school, it represents the peak of Guangdong clan architecture.', zh: '建于1894年，兼具宗祠和书院功能，代表广东宗族建筑的巅峰。' }),
      j(['Roof ridge sculptures', 'Grey brick carving (灰塑)', 'Guangdong folk art museum']),
      j({ en: 'Shamian Island & River Walk', zh: '沙面岛与珠江漫步' }),
      j({ en: 'End the day on Shamian Island, where colonial-era buildings now house cafés and galleries, then walk along the Pearl River as the city lights up.', zh: '在沙面岛结束这一天，殖民时期建筑如今是咖啡馆和画廊，然后沿珠江散步看城市亮灯。' }),
      j({ en: 'Shamian was a foreign concession from 1861-1943. Today it offers a quiet counterpoint to the city\'s energy.', zh: '沙面1861-1943年间是外国租界。如今它提供了城市能量的安静对照。' }),
      j(['Colonial architecture walk', 'Banyan tree courtyards', 'Pearl River night view']),
      j({ en: 'Riverside dinner', zh: '珠江边晚餐' }),
    ],
  );

  // Route-City Links
  await dataSource.query(
    `INSERT INTO route_city_links (route_id, city_id, sort_order) VALUES ($1, $2, 0), ($3, $4, 0), ($5, $6, 0);`,
    [route1Id, zhanjiangId, route2Id, chaozhouId, route3Id, guangzhouId],
  );

  // ═══════════════════════════════════════════════
  // SHOP (3 collections, 6 products)
  // ═══════════════════════════════════════════════

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

  // Collection 3: Lingnan Heritage (Guangzhou)
  const coll3Res = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published)
     VALUES ('lingnan-heritage', $1, $2, 'guangzhou-culture-walk', '/uploads/seed/guangzhou-qilou-1200.jpg', $3, 2, true) RETURNING id;`,
    [
      j({ en: 'Lingnan Heritage', zh: '岭南遗产' }),
      j({ en: 'Guangzhou Culture Walk', zh: '广州文化漫步' }),
      j({ en: 'Design objects inspired by Guangzhou\'s architectural heritage and Cantonese craft traditions.', zh: '灵感来自广州建筑遗产和粤式工艺传统的设计器物。' }),
    ],
  );
  const coll3Id = coll3Res[0].id;

  // Products (6 total, 2 per collection)
  await dataSource.query(
    `INSERT INTO store_products (slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published)
     VALUES
      ('volcanic-soil-bowl', $1, $2, 32.00, 'SGD', $3, '/uploads/seed/volcanic-soil-bowl-900.jpg', $4, $5, $6, $7, $8, $9, 10, true),
      ('shell-inlay-box', $10, $2, 45.00, 'SGD', $11, '/uploads/seed/volcanic-landscape-800.jpg', $12, $13, $14, $15, $16, $17, 8, true);`,
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
      j({ en: 'Shell Inlay Jewellery Box', zh: '贝壳镶嵌首饰盒' }),
      j({ en: 'Maritime craft', zh: '海洋手作' }),
      j({ en: 'A jewellery box inlaid with shells collected from Zhanjiang\'s volcanic coastline.', zh: '镶嵌湛江火山海岸贝壳的首饰盒。' }),
      j({ en: 'Camphor wood, natural shells, brass hinges', zh: '樟木、天然贝壳、黄铜铰链' }),
      j({ en: '15cm × 10cm × 6cm', zh: '15cm × 10cm × 6cm' }),
      j({ en: 'Zhanjiang coastal villages', zh: '湛江沿海渔村' }),
      j({ en: 'Wipe with dry cloth. Avoid prolonged moisture.', zh: '干布擦拭，避免长时间潮湿。' }),
      j(['/uploads/seed/volcanic-landscape-1200.jpg']),
    ],
  );

  await dataSource.query(
    `INSERT INTO store_products (slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published)
     VALUES
      ('zhuni-teapot', $1, $2, 88.00, 'SGD', $3, '/uploads/seed/chaozhou-tea-800.jpg', $4, $5, $6, $7, $8, $9, 5, true),
      ('dancong-honey-orchid', $10, $2, 45.00, 'SGD', $11, '/uploads/seed/chaozhou-food-800.jpg', $12, $13, $14, $15, $16, $17, 20, true);`,
    [
      j({ en: 'Chaozhou Zhuni Teapot', zh: '潮州朱泥手拉壶' }),
      coll2Id,
      j({ en: 'Master crafted', zh: '大师手作' }),
      j({ en: 'A hand-pulled zhuni clay teapot from Chaozhou, designed specifically for Kungfu Tea brewing.', zh: '潮州手拉朱泥壶，专为功夫茶冲泡设计。' }),
      j({ en: 'Chaozhou zhuni clay, unglazed interior', zh: '潮州朱泥，内壁无釉' }),
      j({ en: '120ml capacity, 8cm height', zh: '容量120ml，高8cm' }),
      j({ en: 'Fengxi, Chaozhou', zh: '潮州·枫溪' }),
      j({ en: 'Season with tea before first use. Never use soap.', zh: '首次使用前用茶水养壶。切勿使用洗涤剂。' }),
      j(['/uploads/seed/chaozhou-tea-1200.jpg']),
      j({ en: 'Phoenix Dancong Honey Orchid', zh: '凤凰单丛蜜兰香' }),
      j({ en: 'Single origin', zh: '单一产地' }),
      j({ en: 'Honey Orchid (蜜兰香) Dancong from Phoenix Mountain, harvested at 800m elevation.', zh: '凤凰山800米海拔采摘的蜜兰香单丛。' }),
      j({ en: 'Oolong tea leaves, spring harvest 2026', zh: '乌龙茶叶，2026年春采' }),
      j({ en: '50g sealed tin', zh: '50g密封罐装' }),
      j({ en: 'Phoenix Mountain, Chaozhou', zh: '潮州·凤凰山' }),
      j({ en: 'Store in cool, dry place. Consume within 12 months.', zh: '阴凉干燥处保存，12个月内饮用。' }),
      j(['/uploads/seed/chaozhou-hero-1200.jpg']),
    ],
  );

  await dataSource.query(
    `INSERT INTO store_products (slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published)
     VALUES
      ('qilou-bookmark-set', $1, $2, 12.00, 'SGD', $3, '/uploads/seed/guangzhou-qilou-1200.jpg', $4, $5, $6, $7, $8, $9, 30, true),
      ('indigo-scarf', $10, $2, 28.00, 'SGD', $11, '/uploads/seed/guangzhou-hero-1200.jpg', $12, $13, $14, $15, $16, $17, 15, true);`,
    [
      j({ en: 'Qilou Bookmark Set', zh: '骑楼书签套装' }),
      coll3Id,
      j({ en: 'Design object', zh: '设计物件' }),
      j({ en: 'A set of 5 brass bookmarks laser-cut in the silhouette of Guangzhou\'s most iconic qilou facades.', zh: '5枚黄铜书签套装，激光切割广州最具标志性的骑楼立面轮廓。' }),
      j({ en: 'Brass, matte finish', zh: '黄铜，哑光处理' }),
      j({ en: '12cm × 3cm each', zh: '每枚12cm × 3cm' }),
      j({ en: 'Guangzhou', zh: '广州' }),
      j({ en: 'Wipe with soft cloth to maintain finish.', zh: '软布擦拭保持光泽。' }),
      j(['/uploads/seed/guangzhou-qilou-1200.jpg']),
      j({ en: 'Lingnan Indigo Scarf', zh: '岭南蓝染围巾' }),
      j({ en: 'Natural dye', zh: '天然染色' }),
      j({ en: 'A hand-dyed indigo scarf using traditional Lingnan plant-based dyeing techniques.', zh: '使用传统岭南植物染色技法手工蓝染的围巾。' }),
      j({ en: 'Organic cotton, natural indigo dye', zh: '有机棉，天然靛蓝染料' }),
      j({ en: '180cm × 60cm', zh: '180cm × 60cm' }),
      j({ en: 'Foshan, Guangdong', zh: '广东·佛山' }),
      j({ en: 'Hand wash cold, dry in shade. Colour may deepen with age.', zh: '冷水手洗，阴干。颜色会随时间加深。' }),
      j(['/uploads/seed/guangzhou-hero-1200.jpg']),
    ],
  );

  // ═══════════════════════════════════════════════
  // INTERPRETING (3 modes, 3 profiles, 4 FAQs)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO interpreting_service_modes (sort_order, title, price, best_for, body, includes, accent, featured)
     VALUES
      (0, $1, $2, $3, $4, $5, 'light', false),
      (1, $6, $7, $8, $9, $10, 'dark', true),
      (2, $11, $12, $13, $14, $15, 'light', false);`,
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
      j({ en: 'Group and study visit', zh: '团体学访' }),
      j({ en: 'Custom pricing', zh: '定制报价' }),
      j({ en: 'Academic and corporate groups', zh: '学术及企业团体' }),
      j({ en: 'Bilingual coordination for multi-stop visits and workshops.', zh: '为多站点学访/活动提供双语协调。' }),
      j(['Pre-trip planning', 'Group coordination', 'Workshop support']),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreter_profiles (sort_order, name, language, focus, helps, avatar, bio, status, city)
     VALUES
      (0, $1, $2, $3, $4, '', $5, 'active', 'Guangzhou'),
      (1, $6, $7, $8, $9, '', $10, 'active', 'Chaozhou'),
      (2, $11, $12, $13, $14, '', $15, 'active', 'Zhanjiang');`,
    [
      j({ en: 'Culture Route Lead', zh: '文化路线领队' }),
      j({ en: 'English / Mandarin / Cantonese', zh: '英语 / 普通话 / 粤语' }),
      j({ en: 'History, neighbourhood reading, food context, route coherence.', zh: '城市史、街区解读、饮食背景与路线连贯性。' }),
      j(['Museum visits', 'Historic streets', 'Route pacing']),
      j({ en: '8 years experience in cultural interpretation across the Pearl River Delta.', zh: '8年珠三角文化口译经验。' }),
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
      (2, $5, $6, 'interpreting'),
      (3, $7, $8, 'interpreting');`,
    [
      j({ en: 'Is this guide service or interpreting?', zh: '这是导游还是口译服务？' }),
      j({ en: 'It combines cultural interpreting with practical travel support.', zh: '这是文化口译与行程支持的组合服务。' }),
      j({ en: 'Can I book only restaurant or transport help?', zh: '可以只预约餐厅或交通支持吗？' }),
      j({ en: 'Yes, short support is available for key moments.', zh: '可以，支持短时段关键场景服务。' }),
      j({ en: 'Must I follow a route exactly?', zh: '必须严格按路线执行吗？' }),
      j({ en: 'No, routes are starting points and can be customized.', zh: '不用，路线可按你的安排灵活调整。' }),
      j({ en: 'How is this different from a generic translator?', zh: '与普通翻译有何不同？' }),
      j({ en: 'You also get local pacing, etiquette and route logic.', zh: '除了语言，还提供本地节奏、礼仪与路线逻辑。' }),
    ],
  );

  // ═══════════════════════════════════════════════
  // EVENTS (3)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO events (slug, title, summary, description, city, city_slug, date, end_date, tags, image, status, related_route_slugs)
     VALUES
      ('zhanjiang-coast-night', $1, $2, $3, 'Zhanjiang', 'zhanjiang', '2026-06-20', '2026-06-20', $4, '/uploads/seed/zhanjiang-hero-1200.jpg', 'published', $5),
      ('chaoshan-tea-festival', $6, $7, $8, 'Chaozhou', 'chaozhou', '2026-07-15', '2026-07-18', $9, '/uploads/seed/chaozhou-tea-1200.jpg', 'published', $10),
      ('guangfu-dragon-boat', $11, $12, $13, 'Guangzhou', 'guangzhou', '2026-06-01', '2026-06-03', $14, '/uploads/seed/guangzhou-hero-1200.jpg', 'published', $15);`,
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
      j({ en: 'Guangfu Dragon Boat Invitational', zh: '广府龙舟邀请赛' }),
      j({ en: 'Twelve dragon boat teams from the Greater Bay Area compete on the Pearl River.', zh: '粤港澳大湾区12支龙舟队齐聚珠江竞渡。' }),
      j({ en: 'The annual dragon boat race is not just sport — it is a cultural symbol passed down for millennia in the Guangfu region, with traditional ceremonies and food markets.', zh: '一年一度的龙舟赛不仅是体育竞技，更是广府地区传承千年的文化符号，伴有传统仪式和美食市集。' }),
      j(['dragon boat', 'sport', 'tradition']),
      j(['guangzhou-culture-walk']),
    ],
  );

  // ═══════════════════════════════════════════════
  // COMMUNITY POSTS (5) + BRIEFS (3)
  // ═══════════════════════════════════════════════

  await dataSource.query(
    `INSERT INTO community_posts (channel, status, "user", title, excerpt, tags, image, location, route, mood, likes, comments, saves)
     VALUES
      ('FieldNotes', 'published', $1, $2, $3, $4, '/uploads/seed/volcanic-landscape-1200.jpg', 'Zhanjiang', 'southern-sea-table', 'curious', 12, 4, 6),
      ('FoodMap', 'published', $5, $6, $7, $8, '/uploads/seed/chaozhou-food-800.jpg', 'Chaozhou', 'chaoshan-tea-culture', 'warm', 89, 15, 32),
      ('HiddenStop', 'published', $9, $10, $11, $12, '/uploads/seed/guangzhou-qilou-1200.jpg', 'Guangzhou', 'guangzhou-culture-walk', 'amazed', 156, 28, 67),
      ('CultureDesk', 'published', $13, $14, $15, $16, '/uploads/seed/chaozhou-hero-1200.jpg', 'Chaozhou', 'chaoshan-tea-culture', 'reflective', 234, 41, 98),
      ('FieldNotes', 'pending_review', $17, $18, $19, $20, '/uploads/seed/southern-coast-1200.jpg', 'Zhanjiang', 'southern-sea-table', 'excited', 0, 0, 0);`,
    [
      j({ name: 'LingTour Team', handle: 'lingtour', avatar: '' }),
      j({ en: 'Morning auction notes', zh: '清晨拍卖现场笔记' }),
      j({ en: 'The auction rhythm explains local seafood hierarchy better than any brochure.', zh: '拍卖节奏比任何宣传册都更能解释本地海鲜层级。' }),
      j(['market', 'coast', 'seafood']),
      j({ name: '林小明', handle: 'xiaoming_lin', avatar: '' }),
      j({ en: 'Century-old tea shop on Paifang Street', zh: '牌坊街百年茶铺' }),
      j({ en: 'Found a four-generation tea shop at the corner of Paifang Street — their Dancong is all from their own garden.', zh: '在牌坊街拐角处发现一家传承四代的老茶铺，凤凰单丛都是自家茶园采摘的。' }),
      j(['tea', 'Chaozhou', 'heritage']),
      j({ name: 'Emma Wilson', handle: 'emma_explores', avatar: '' }),
      j({ en: 'Hidden alleys of Shamian Island', zh: '沙面岛的隐秘小巷' }),
      j({ en: 'Beyond the main boulevard, I found quiet lanes with stunning colonial architecture and stories in the breeze.', zh: '在主干道之外，我发现了安静的小巷，殖民建筑和微风中的故事。' }),
      j(['Guangzhou', 'architecture', 'hidden gems']),
      j({ name: 'Sarah Thompson', handle: 'sarah_lingnan', avatar: '' }),
      j({ en: 'The Lingnan architecture language', zh: '岭南建筑语言' }),
      j({ en: 'A deep dive into architectural elements that define Guangdong — from wok-handle roofs to oyster-shell walls.', zh: '深入探索定义广东的建筑元素——从镬耳山墙到蚝壳墙。' }),
      j(['architecture', 'heritage', 'Lingnan']),
      j({ name: '张美玲', handle: 'meiling_zhang', avatar: '' }),
      j({ en: 'Naozhou Island lighthouse and volcanic rock', zh: '硇洲岛灯塔与火山岩' }),
      j({ en: 'Naozhou is China\'s largest volcanic island — the lighthouse has watched over the South China Sea for 120 years.', zh: '硇洲岛是中国最大的火山岛——灯塔已守望南海120年。' }),
      j(['Zhanjiang', 'lighthouse', 'volcanic']),
    ],
  );

  // Community Briefs
  await dataSource.query(
    `INSERT INTO community_briefs (slug, title, prompt, channel, location, route, mood, sort_order, active)
     VALUES
      ('coast-morning', $1, $2, 'FieldNotes', 'Zhanjiang', 'southern-sea-table', 'curious', 0, true),
      ('tea-ritual', $3, $4, 'CultureDesk', 'Chaozhou', 'chaoshan-tea-culture', 'reflective', 1, true),
      ('hidden-lane', $5, $6, 'HiddenStop', 'Guangzhou', 'guangzhou-culture-walk', 'amazed', 2, true);`,
    [
      j({ en: 'A morning on the coast', zh: '海岸的一个清晨' }),
      j({ en: 'Describe what you saw, heard, and smelled during a morning at Zhanjiang\'s coast. Focus on the working rhythm rather than scenery.', zh: '描述你在湛江海岸的一个清晨所见、所闻、所嗅。关注劳动节奏而非风景。' }),
      j({ en: 'The tea ritual', zh: '茶的仪式' }),
      j({ en: 'Write about a moment during Kungfu Tea that changed how you think about time or attention.', zh: '写一个功夫茶过程中改变你对时间或注意力看法的瞬间。' }),
      j({ en: 'A lane you almost missed', zh: '你差点错过的巷子' }),
      j({ en: 'Tell us about a hidden lane or alley that revealed something unexpected about the city.', zh: '告诉我们一条隐秘的巷子如何揭示了城市意想不到的一面。' }),
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
          { title: { en: '3+', zh: '3+' }, description: { en: 'Cities Explored', zh: '深度探索城市' } },
          { title: { en: '3+', zh: '3+' }, description: { en: 'Curated Routes', zh: '精心设计路线' } },
          { title: { en: '6+', zh: '6+' }, description: { en: 'Cultural Products', zh: '文化商品' } },
          { title: { en: '3', zh: '3' }, description: { en: 'Local Interpreters', zh: '本地口译员' } },
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
        { slug: 'guangzhou', title: { en: 'Cantonese Heritage', zh: '广府遗产' }, body: { en: 'Two thousand years of trade and taste.', zh: '两千年的贸易与味道。' } },
      ]),
      j([
        { quote: { en: 'I left understanding why every dish mattered.', zh: '我终于明白每一道菜为何重要。' }, name: { en: 'Lina, Singapore', zh: 'Lina，新加坡' } },
        { quote: { en: 'The interpreter explained the market like a living classroom.', zh: '口译员把市场讲成了一堂活课。' }, name: { en: 'Marcus, UK', zh: 'Marcus，英国' } },
        { quote: { en: 'The tea ceremony changed how I think about time.', zh: '茶道改变了我对时间的理解。' }, name: { en: 'James K., Australia', zh: 'James K.，澳大利亚' } },
      ]),
      j(['southern-sea-table', 'chaoshan-tea-culture', 'guangzhou-culture-walk']),
      j(['volcanic-soil-bowl', 'zhuni-teapot', 'qilou-bookmark-set']),
      j(['zhanjiang', 'chaozhou', 'guangzhou']),
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

  console.log('Seed complete. Inserted: 3 cities, 3 routes (12 stops), 3 collections (6 products), 3 events, 5 community posts, 3 briefs, 3 interpreting modes, 3 profiles, 4 FAQs, home config, app settings.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

