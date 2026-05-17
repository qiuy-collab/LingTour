import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const i18n = (en: string, zh: string) => ({ en, zh });

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

  await dataSource.query('DELETE FROM users WHERE email <> $1', ['admin@lingtour.cn']);

  const passwordHash = await bcrypt.hash('LingTour2026!', 12);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ('admin@lingtour.cn', $1, 'admin', 'LingTour Admin')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name;`,
    [passwordHash],
  );

  const cityRes = await dataSource.query(
    `INSERT INTO cities (
      slug, name, region_label, hero_image, hero_narrative, tags, editor_intro,
      gallery_images, food_title, food_description, food_images, adcode, published
    ) VALUES (
      'zhanjiang', $1, $2,
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
      $3, $4, $5,
      $6, $7, $8, $9,
      440800, true
    ) RETURNING id;`,
    [
      JSON.stringify(i18n('Zhanjiang', '湛江')),
      JSON.stringify(i18n('Southern coast', '南方海岸')),
      JSON.stringify(i18n(
        'At the southern tip of mainland China, Zhanjiang faces the open sea. Its rhythm is set by tides and auctions, not highways.',
        '在中国大陆最南端，湛江直面南海。这里的节奏由潮汐与拍卖决定，而非高速公路。',
      )),
      JSON.stringify(['Coast', 'Seafood', 'Volcanic landscape']),
      JSON.stringify(i18n(
        'Volcanic shorelines, fishing harbours, seafood markets, and maritime life.',
        '火山海岸、渔港、海鲜市场与海洋生活。',
      )),
      JSON.stringify([
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ]),
      JSON.stringify(i18n('Flavours of Zhanjiang', '湛江风味')),
      JSON.stringify(i18n(
        'From dawn seafood markets to volcanic soil farms, Zhanjiangs table tells the story of the southern coast.',
        '从清晨海鲜市场到火山土壤农田，湛江的餐桌讲述着南方海岸的故事。',
      )),
      JSON.stringify([
        'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      ]),
    ],
  );
  const cityId = cityRes[0].id;

  await dataSource.query(
    `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, 0),
      ($1, $9, $10, $11, $12, $13, $14, $15, 1),
      ($1, $16, $17, $18, $19, $20, $21, $22, 2);`,
    [
      cityId,
      JSON.stringify(i18n('Southern coast', '南方海岸')),
      JSON.stringify(i18n('The coast follows a daily rhythm of boats, markets and tides.', '海岸线遵循着渔船、市场与潮汐的日常节奏。')),
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(i18n('Coastline', '海岸线')),
      JSON.stringify(i18n('1,243 km', '1243 公里')),
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
      JSON.stringify(i18n('This is a daily rhythm, not a postcard coastline.', '这里不是明信片海岸，而是日常生活的节奏。')),
      JSON.stringify(i18n('Fishing communities', '渔村社区')),
      JSON.stringify(i18n('Fishing villages shape local economy, family life and food culture.', '渔村塑造了本地经济、家庭生活和饮食文化。')),
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(i18n('Fishing villages', '渔村')),
      JSON.stringify(i18n('100+ villages', '100+ 渔村')),
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
      JSON.stringify(i18n('What reaches your table tonight was in open water this morning.', '今晚餐桌上的海鲜，今晨还在外海。')),
      JSON.stringify(i18n('Volcanic landscape', '火山地貌')),
      JSON.stringify(i18n('Leizhou peninsula volcanic geology powers fertile local agriculture.', '雷州半岛火山地质带来了肥沃土壤与农业活力。')),
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(i18n('Volcanic cones', '火山锥')),
      JSON.stringify(i18n('80+', '80+')),
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1400&q=80',
      JSON.stringify(i18n('Geological time still shapes daily life here.', '地质时间至今仍在塑造这里的日常。')),
    ],
  );

  const routeRes = await dataSource.query(
    `INSERT INTO story_routes (
      slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published
    ) VALUES (
      'southern-sea-table',
      $1, 'Coastal', $2, $3, $4, $5, $6,
      'https://picsum.photos/seed/zhanjiang-coast/1400/900', true
    ) RETURNING id;`,
    [
      JSON.stringify(i18n('A Southern Sea Table', '一张朝南的餐桌')),
      JSON.stringify(i18n('Zhanjiang', '湛江')),
      JSON.stringify(i18n('1 day', '1 天')),
      JSON.stringify(i18n('Curious travellers', '好奇旅行者')),
      JSON.stringify(i18n('A one-day route through Zhanjiang from volcanic lake to seafood dinner.', '一条从火山湖到海鲜晚餐的湛江一日路线。')),
      JSON.stringify(i18n('Every stop traces back to the relationship between city and sea.', '每一个站点都回到城市与海洋的关系。')),
    ],
  );
  const routeId = routeRes[0].id;

  await dataSource.query(
    `INSERT INTO route_stops (
      route_id, sort_order, time, stop_name, story, cultural_story, details, image, lat, lng, meal, hotel, transit
    ) VALUES
      ($1, 0, '08:00', $2, $3, $4, $5, 'https://picsum.photos/seed/huguangyan-lake/1200/800', 21.147, 110.277, NULL, NULL, NULL),
      ($1, 1, '11:00', $6, $7, $8, $9, 'https://picsum.photos/seed/dongfeng-market/1200/800', 21.196, 110.404, NULL, NULL, NULL),
      ($1, 2, '14:00', $10, $11, $12, $13, 'https://picsum.photos/seed/xiashan-french/1200/800', 21.197, 110.411, NULL, NULL, NULL),
      ($1, 3, '17:30', $14, $15, $16, $17, 'https://picsum.photos/seed/jinsha-bay/1200/800', 21.249, 110.427, $18, NULL, NULL);`,
    [
      routeId,
      JSON.stringify(i18n('Huguangyan Maar Lake', '湖光岩玛珥湖')),
      JSON.stringify(i18n('Start at a volcanic lake formed 160,000 years ago.', '从形成于约 16 万年前的火山湖开始。')),
      JSON.stringify(i18n('A UNESCO geopark with rare maar structure.', '联合国教科文组织地质公园，拥有罕见玛珥构造。')),
      JSON.stringify(['UNESCO geopark', '2.3 km trail', 'Volcanic geology museum']),
      JSON.stringify(i18n('Dongfeng Seafood Market', '东风海鲜市场')),
      JSON.stringify(i18n('The morning catch arrives directly from harbour.', '清晨渔获直接从渔港进入市场。')),
      JSON.stringify(i18n('Bidding rhythm and dialect reflect deep maritime culture.', '叫价节奏与方言保留着深层海洋文化。')),
      JSON.stringify(['Seafood wholesale market', 'Morning auction', 'Seasonal catch']),
      JSON.stringify(i18n('Xiashan French Heritage', '霞山法式遗迹')),
      JSON.stringify(i18n('Walk former French leasehold streets and buildings.', '步行探访法租时期街区与建筑。')),
      JSON.stringify(i18n('Colonial architecture and local life overlap in one district.', '殖民建筑与本地日常生活在同一街区并存。')),
      JSON.stringify(['Former customs house', 'Catholic church', 'Old villas']),
      JSON.stringify(i18n('Jinsha Bay and Seafood Dinner', '金沙湾与海鲜晚餐')),
      JSON.stringify(i18n('End with a seafood table facing the South China Sea.', '以面向南海的海鲜晚餐收束全日体验。')),
      JSON.stringify(i18n('The meal is the final chapter of the route.', '这顿饭是路线的最后一章。')),
      JSON.stringify(['Beach promenade', 'Seafood courses', 'Sunset by the bay']),
      JSON.stringify(i18n('Seafood dinner', '海鲜晚餐')),
    ],
  );

  await dataSource.query(
    'INSERT INTO route_city_links (route_id, city_id, sort_order) VALUES ($1, $2, 0)',
    [routeId, cityId],
  );

  const collectionRes = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published)
     VALUES ('coastal-life-kit', $1, $2, 'southern-sea-table', $3, $4, 0, true)
     RETURNING id;`,
    [
      JSON.stringify(i18n('Coastal Life Kit', '海岸生活套组')),
      JSON.stringify(i18n('A Southern Sea Table', '一张朝南的餐桌')),
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82',
      JSON.stringify(i18n(
        'Objects from the Zhanjiang coast: volcanic clay ceramics and maritime craft.',
        '来自湛江海岸的器物：火山陶土器皿与海洋手作。',
      )),
    ],
  );
  const collectionId = collectionRes[0].id;

  await dataSource.query(
    `INSERT INTO store_products (
      slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published
    ) VALUES (
      'volcanic-soil-bowl',
      $1, $2, 32.00, 'SGD', $3,
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82',
      $4, $5, $6, $7, $8, $9, 10, true
    );`,
    [
      JSON.stringify(i18n('Volcanic Soil Tea Bowl', '火山土茶碗')),
      collectionId,
      JSON.stringify(i18n('Handcrafted', '手工制作')),
      JSON.stringify(i18n('A bowl fired from Leizhou volcanic clay.', '使用雷州火山陶土烧制。')),
      JSON.stringify(i18n('Natural volcanic clay, lead-free matte glaze', '天然火山陶土，无铅哑光釉')),
      JSON.stringify(i18n('9cm diameter, 5cm height', '直径9cm，高5cm')),
      JSON.stringify(i18n('Leizhou Peninsula, Zhanjiang', '湛江·雷州半岛')),
      JSON.stringify(i18n('Hand wash only; not for microwave.', '建议手洗，不建议微波。')),
      JSON.stringify([
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82',
        'https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82',
      ]),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreting_service_modes (sort_order, title, price, best_for, body, includes, accent, featured)
     VALUES
      (0, $1, $2, $3, $4, $5, 'light', false),
      (1, $6, $7, $8, $9, $10, 'dark', true),
      (2, $11, $12, $13, $14, $15, 'light', false);`,
    [
      JSON.stringify(i18n('City companion interpreting', '城市同行口译')),
      JSON.stringify(i18n('From RMB 680 / half day', 'RMB 680 / 半天起')),
      JSON.stringify(i18n('Independent visitors', '独立访客')),
      JSON.stringify(i18n('Ground support for transit, ordering, ticketing and etiquette.', '提供交通、点餐、购票与礼仪支持。')),
      JSON.stringify(['English support', 'Restaurant help', 'Local etiquette']),
      JSON.stringify(i18n('Story route guided support', '故事路线引导支持')),
      JSON.stringify(i18n('From RMB 1,280 / half day', 'RMB 1,280 / 半天起')),
      JSON.stringify(i18n('Route followers', '路线探索者')),
      JSON.stringify(i18n('Keep route pacing and cultural thread clear across all stops.', '保障全程节奏与文化线索清晰连贯。')),
      JSON.stringify(['Route pacing', 'Stop-by-stop storytelling', 'Menu help']),
      JSON.stringify(i18n('Group and study visit', '团体学访')),
      JSON.stringify(i18n('Custom pricing', '定制报价')),
      JSON.stringify(i18n('Academic and corporate groups', '学术及企业团体')),
      JSON.stringify(i18n('Bilingual coordination for multi-stop visits and workshops.', '为多站点学访/活动提供双语协调。')),
      JSON.stringify(['Pre-trip planning', 'Group coordination', 'Workshop support']),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreter_profiles (sort_order, name, language, focus, helps)
     VALUES
      (0, $1, $2, $3, $4),
      (1, $5, $6, $7, $8),
      (2, $9, $10, $11, $12);`,
    [
      JSON.stringify(i18n('Culture Route Lead', '文化路线领队')),
      JSON.stringify(i18n('English / Mandarin / Cantonese', '英语 / 普通话 / 粤语')),
      JSON.stringify(i18n('History, neighbourhood reading, food context, route coherence.', '城市史、街区解读、饮食背景与路线连贯性。')),
      JSON.stringify(['Museum visits', 'Historic streets', 'Route pacing']),
      JSON.stringify(i18n('Food and Local Life Host', '美食与本地生活向导')),
      JSON.stringify(i18n('English / Mandarin', '英语 / 普通话')),
      JSON.stringify(i18n('Markets, menus, tea culture, everyday interaction support.', '市场、菜单、茶文化与日常互动支持。')),
      JSON.stringify(['Menus', 'Tea culture', 'Market walks']),
      JSON.stringify(i18n('Study Visit Coordinator', '学访协调员')),
      JSON.stringify(i18n('English / Mandarin', '英语 / 普通话')),
      JSON.stringify(i18n('Schedules, check-ins, group movement control.', '行程、签到与团队动线协调。')),
      JSON.stringify(['Schedules', 'Check-ins', 'Group movement']),
    ],
  );

  await dataSource.query(
    `INSERT INTO interpreting_faqs (sort_order, question, answer)
     VALUES
      (0, $1, $2),
      (1, $3, $4),
      (2, $5, $6),
      (3, $7, $8);`,
    [
      JSON.stringify(i18n('Is this guide service or interpreting?', '这是导游还是口译服务？')),
      JSON.stringify(i18n('It combines cultural interpreting with practical travel support.', '这是文化口译与行程支持的组合服务。')),
      JSON.stringify(i18n('Can I book only restaurant or transport help?', '可以只预约餐厅或交通支持吗？')),
      JSON.stringify(i18n('Yes, short support is available for key moments.', '可以，支持短时段关键场景服务。')),
      JSON.stringify(i18n('Must I follow a route exactly?', '必须严格按路线执行吗？')),
      JSON.stringify(i18n('No, routes are starting points and can be customized.', '不用，路线可按你的安排灵活调整。')),
      JSON.stringify(i18n('How is this different from a generic translator?', '与普通翻译有何不同？')),
      JSON.stringify(i18n('You also get local pacing, etiquette and route logic.', '除了语言，还提供本地节奏、礼仪与路线逻辑。')),
    ],
  );

  await dataSource.query(
    `INSERT INTO events (
      slug, title, summary, description, city, city_slug, date, end_date, tags, image, status, related_route_slugs
    ) VALUES
      ('zhanjiang-coast-night', $1, $2, $3, 'Zhanjiang', 'zhanjiang', '2026-06-20', '2026-06-20', $4, $5, 'published', $6);`,
    [
      JSON.stringify(i18n('Zhanjiang Coast Story Night', '湛江海岸故事夜')),
      JSON.stringify(i18n('An evening gathering on maritime food and route stories.', '一场围绕海洋饮食与路线故事的夜间活动。')),
      JSON.stringify(i18n('Community event with route narrators and local interpreters.', '由路线讲述者与本地口译员共同参与的社区活动。')),
      JSON.stringify(['community', 'story', 'food']),
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['southern-sea-table']),
    ],
  );

  await dataSource.query(
    `INSERT INTO community_posts (
      channel, status, "user", title, excerpt, tags, image, location, route, mood, likes, comments, saves
    ) VALUES
      ('field-notes', 'published', $1, $2, $3, $4, $5, 'Zhanjiang', 'southern-sea-table', 'curious', 12, 4, 6);`,
    [
      JSON.stringify({ name: 'LingTour Team', avatar: '' }),
      JSON.stringify(i18n('Morning auction notes', '清晨拍卖现场笔记')),
      JSON.stringify(i18n('The auction rhythm explains local seafood hierarchy better than any brochure.', '拍卖节奏比任何宣传册都更能解释本地海鲜层级。')),
      JSON.stringify(['market', 'coast']),
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80',
    ],
  );

  await dataSource.query(
    `INSERT INTO home_configs (
      hero, trust_metrics, entry_cards, culture_highlights, testimonials,
      featured_route_slugs, featured_product_slugs, featured_city_slugs
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    [
      JSON.stringify({
        title: i18n('LingTour', 'LingTour 岭途'),
        subtitle: i18n('Story-shaped routes across Guangdong', '在广东，用故事串起城市与旅行'),
      }),
      JSON.stringify([
        { value: '1', label: i18n('Featured city', '精选城市') },
        { value: '1', label: i18n('Story route', '故事路线') },
        { value: '1', label: i18n('Cultural collection', '文化商品系列') },
      ]),
      JSON.stringify([
        { id: '01', title: i18n('Culture', '文化'), body: i18n('Read city stories behind each destination.', '阅读每个目的地背后的城市故事。'), href: '/culture' },
        { id: '02', title: i18n('Story Routes', '故事路线'), body: i18n('Follow one cultural thread through a city.', '沿着一条文化线索探索一座城市。'), href: '/routes' },
        { id: '03', title: i18n('Interpreter Service', '口译服务'), body: i18n('Book local bilingual support.', '预约本地双语支持。'), href: '/interpreting' },
        { id: '04', title: i18n('Lingnan Store', '文创商城'), body: i18n('Take home objects tied to stories.', '带走与故事相关联的器物。'), href: '/shop' },
      ]),
      JSON.stringify([
        { slug: 'zhanjiang', title: i18n('Southern Coast', '南方海岸'), body: i18n('Volcanic shoreline and maritime life.', '火山海岸与海洋生活。') },
      ]),
      JSON.stringify([
        { quote: i18n('I left understanding why every dish mattered.', '我终于明白每一道菜为何重要。'), name: i18n('Lina, Singapore', 'Lina，新加坡') },
        { quote: i18n('The interpreter explained the market like a living classroom.', '口译员把市场讲成了一堂活课。'), name: i18n('Marcus, UK', 'Marcus，英国') },
      ]),
      JSON.stringify(['southern-sea-table']),
      JSON.stringify(['volcanic-soil-bowl']),
      JSON.stringify(['zhanjiang']),
    ],
  );

  await dataSource.query(
    `INSERT INTO app_settings (scope, payload)
     VALUES ('default', $1)
     ON CONFLICT (scope) DO UPDATE SET payload = EXCLUDED.payload;`,
    [JSON.stringify({
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
    })],
  );

  console.log('Seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
