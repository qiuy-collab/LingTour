import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'lingtour',
    password: process.env.DB_PASSWORD ?? 'lingtour_dev',
    database: process.env.DB_DATABASE ?? 'lingtour',
  });

  await dataSource.initialize();
  console.log('📦 Connected to database. Seeding...\n');

  // ═══════════════════════════════════════════════════════
  // 1. Admin user
  // ═══════════════════════════════════════════════════════
  const passwordHash = await bcrypt.hash('LingTour2026!', 12);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name) VALUES
     ('admin@lingtour.cn', $1, 'admin', 'LingTour Admin')
     ON CONFLICT (email) DO NOTHING;`,
    [passwordHash],
  );
  console.log('✅ Admin user seeded (admin@lingtour.cn / LingTour2026!)');

  // ═══════════════════════════════════════════════════════
  // 2. City: Zhanjiang
  // ═══════════════════════════════════════════════════════
  const cityResult = await dataSource.query(
    `INSERT INTO cities (slug, name, region_label, hero_image, hero_narrative, tags, editor_intro, gallery_images, food_title, food_description, food_images, published) VALUES
     (
       'zhanjiang',
       $1,
       $2,
       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
       $3,
       $4,
       $5,
       ARRAY[
         'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
         'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
         'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80'
       ],
       $6,
       $7,
       ARRAY[
         'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
         'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
         'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
         'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
       ],
       true
     )
     RETURNING id;`,
    [
      JSON.stringify({ en: 'Zhanjiang', zh: '湛江' }),
      JSON.stringify({ en: 'Southern coast', zh: '南部海岸' }),
      JSON.stringify({
        en: 'Zhanjiang opens the southern sea chapter of Guangdong.',
        zh: '湛江揭开了广东南部海洋的篇章。',
      }),
      JSON.stringify([
        { en: 'Coast', zh: '滨海' },
        { en: 'Seafood', zh: '海鲜' },
        { en: 'Volcanic landscape', zh: '火山地貌' },
      ]),
      JSON.stringify({
        en: '## Zhanjiang: Where the coast comes first\n\nZhanjiang sits at the southern tip of mainland China, facing the South China Sea across 1,243 km of coastline. At the southern tip of mainland China, Zhanjiang faces the open sea. Its rhythm is set by tides and auctions, not highways. Volcanic crater lakes, fishing harbours, and colonial streets sit within a single day\'s reach.',
        zh: '## 湛江：海岸线第一\n\n湛江位于中国大陆最南端，面朝南海，拥有 1,243 公里海岸线。在中国大陆最南端，湛江直面开阔的南海。这里的节奏由潮汐和拍卖决定，而非红绿灯。火山口湖、渔港和法式殖民街道，一天之内皆可抵达。',
      }),
      JSON.stringify({ en: 'Flavours of Zhanjiang', zh: '湛江风味' }),
      JSON.stringify({
        en: 'From dawn seafood markets to volcanic soil farms, Zhanjiang\'s table tells the story of the southern coast.',
        zh: '从清晨的海鲜市场到火山土壤农田，湛江的餐桌讲述着南部海岸的故事。',
      }),
    ],
  );

  const cityId = cityResult[0]?.id;
  console.log(`✅ City "Zhanjiang" seeded (id: ${cityId})`);

  // ═══════════════════════════════════════════════════════
  // 3. City culture sections (3 sections with full content)
  // ═══════════════════════════════════════════════════════
  if (cityId) {
    await dataSource.query(
      `INSERT INTO city_culture_sections (city_id, title, body, image, stat_label, stat_value, breath_image, breath_quote, sort_order) VALUES
       ($1, $2, $3, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', $4, $5, $6, $7, 0),
       ($1, $8, $9, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80', $10, $11, $12, $13, 1),
       ($1, $14, $15, 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80', $16, $17, $18, $19, 2);`,
      [
        // Section 0: Southern coast
        JSON.stringify({ en: 'Southern coast', zh: '南方海岸' }),
        JSON.stringify({
          en: 'Zhanjiang sits at the southern tip of mainland China, facing the South China Sea across 1,243 km of coastline. It is not the Pearl River Delta. There are no factory clusters or expressway networks here. Instead: beaches that run for kilometres without a high-rise in sight, black basalt headlands carved into platforms by the surf, mangrove estuaries, and more than 100 offshore islands — Naozhou, Donghai, Leizhou among them.\n\nThe coast follows a daily rhythm. Dawn belongs to fishing boats motoring out through sheltered channels. Mid-morning, the catch moves to market. Midday, the city eats. Late afternoon fills the beaches with swimmers. By dusk, the coast returns to the sea.\n\nFor a visitor, this is not a drive-by destination. It is a place to walk, eat, and watch. The southern coast marks the line where Guangdong stops being a river civilisation and becomes an ocean one.',
          zh: '湛江位于中国大陆最南端，面朝南海，拥有 1,243 公里海岸线。它不是珠三角。这里没有工厂集群和高速路网，取而代之的是绵延数公里、不见高楼的海滩，被海浪削平成为平台的黑色玄武岩岬角，红树林河口，以及 100 多座离岛——硇洲岛、东海岛、雷州岛。\n\n海岸遵循着日常节奏。黎明属于渔船，穿过避风航道驶向大海。上午，渔获进入市场。正午，全城开饭。午后，海滩上满是在游泳的人。黄昏时分，海岸归还给海洋。\n\n对旅行者而言，这不是一个驱车一瞥的目的地。这是一个需要你行走、品尝和凝视的地方。南方海岸标记着广东从河流文明变成海洋文明的那条分界线。',
        }),
        JSON.stringify({ en: '1,243 km of coastline · 100+ offshore islands · 3 national nature reserves', zh: '1,243 公里海岸线 · 100+ 座离岛 · 3 个国家级自然保护区' }),
        JSON.stringify({ en: 'Coastline', zh: '海岸线' }),
        JSON.stringify({ en: 'Breathing coastal air — the South China Sea on one side, volcanic soil on the other.', zh: '呼吸着海岸的空气——一边是南海，一边是火山土壤。' }),
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
        JSON.stringify({
          en: '"This is not a shoreline you photograph once. It is a daily rhythm: tides, wet-market cries, the salt-sweet smell of the morning haul."',
          zh: '"这不是一条你拍一张照片就够的海岸线。它是一个日常节奏：潮汐、市场的叫卖声、清晨渔获的咸甜气味。"',
        }),

        // Section 1: Fishing communities
        JSON.stringify({ en: 'Fishing communities', zh: '渔村' }),
        JSON.stringify({
          en: 'Fishing is not an exhibit in Zhanjiang. It is the economy, the calendar, and the social fabric. Along nearly every inlet and river mouth, a fishing village faces the water. Houses are built from coral stone or concrete. The day begins before sunrise, when boats motor out through the channel, their lights still visible in the dark.\n\nThese villages run on their own logic. Men go out on boats. Women sort the catch, sell it, and preserve the rest. Children learn fish names before street names. The village elder reads weather patterns the way a city person reads a metro map.\n\nThe market is the best place to understand this world. It is not designed for visitors. The floor is wet. Ice glistens. Bargaining happens in Leizhou Min, a dialect unintelligible to Mandarin speakers. Walking through, you read the coast through what sits on the table: silver mackerel, pink prawns, dark green seaweed — the colours of last night\'s voyage.\n\nThese communities are under pressure. Younger people are moving to cities. Industrial fleets compete with traditional boats. Climate shifts are altering fish stocks. To visit now is to see a way of life that is still alive but not guaranteed.',
          zh: '在湛江，渔业不是展览品。它是经济结构、日历和社会织体。几乎每条水道和河口都有一个面朝大海的渔村。房屋用珊瑚石或混凝土建成。日出之前一天就开始了——渔船穿过水道，船灯在夜色中闪烁。\n\n这些渔村有自己的运行逻辑。男人出海；女人分拣渔获、销售、腌制储存；小孩学鱼名的年龄比学路名还早。村长识别天气模式就像城里人看地铁图一样自然。\n\n市场是理解这个世界的最佳场所。它不是为游客设计的。地面是湿的，碎冰在发光。讨价还价用雷州闽语进行——一种连粤语使用者都听不懂的语言。穿过市场，你通过餐桌上的东西来阅读海岸：银色鲭鱼、粉色虾、深绿色海藻——昨夜航行的色彩。\n\n这些社区正面临压力。年轻人在往城市迁徙；工业船队与传统渔船竞争；气候变化正在改变鱼群分布。此刻到访，你看到的是一种仍然活着但不保证会永远持续的生活方式。',
        }),
        JSON.stringify({ en: '100+ fishing villages · 10,000+ families living from the sea', zh: '100+ 个渔村 · 10,000+ 个以海为生的家庭' }),
        JSON.stringify({ en: 'Fishing villages', zh: '渔村' }),
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        JSON.stringify({
          en: '"What arrives on the table tonight was in open water this morning. Zhanjiang does not sit beside the sea — it lives on it."',
          zh: '"今晚餐桌上的东西，今早还在开阔的海水中。湛江不坐在海边——它活在海上。"',
        }),

        // Section 2: Volcanic landscape
        JSON.stringify({ en: 'Volcanic landscape', zh: '火山地貌' }),
        JSON.stringify({
          en: 'Few travellers expect to find volcanoes in Guangdong, but the Leizhou Peninsula — the southern half of Zhanjiang\'s territory — was shaped by eruptions over the past several million years. The result is a landscape that feels nothing like the rest of the province: black basalt outcrops, dark fertile soil, and a coastline where lava once met the sea.\n\nThe best place to see this is Naozhou Island, where hexagonal basalt columns rise from the water. Formed by the slow cooling of lava, they stand in geometric ranks, like a pipe organ built for the ocean. Walking this shore, you can feel the deep time of the place: tectonic collision, molten rock, and the long weathering that turned fire into soil.\n\nThat volcanic soil powers Zhanjiang\'s farms. Pineapple plantations, sugarcane fields, and banana groves all owe their fertility to ancient eruptions. The dark earth here retains water and minerals that sandy delta soils cannot hold. The pineapples taste sweeter. The vegetables grow faster. There is a direct line — visible to anyone paying attention — between the volcanoes of the past and the abundance on today\'s tables.\n\nComing from Guangzhou or Shenzhen, this terrain registers as a shock. The Pearl River Delta feels planned, managed, paved. Zhanjiang\'s volcanic landscape is ungoverned. It is a reminder that Guangdong is not only a province of commerce and high-speed rail, but also one of tectonic forces, tropical agriculture, and coastlines shaped by geological time.',
          zh: '很少有旅行者预料到会在广东发现火山。但雷州半岛——湛江南半部——是由过去数百万年的喷发塑造而成的。其结果是一片与省内其他地方截然不同的地貌：黑色玄武岩露头、暗色肥沃土壤，以及熔岩曾经与海洋相遇的海岸线。\n\n观赏这一地貌的最佳地点是硇洲岛，六棱形玄武岩石柱从水中升起。由熔岩缓慢冷却形成，它们以几何队列排列着，仿佛一座为海洋建造的管风琴。行走在这片海岸上，你能感受到这个地方的深层时间：构造碰撞、熔岩，以及将烈火转化为土壤的漫长风化过程。\n\n火山土壤滋养着湛江的农场。菠萝种植园、甘蔗田和香蕉林都得益于远古喷发的肥力。这里的深色土壤能保持沙质三角洲土壤无法持有的水分和矿物质。菠萝更甜。蔬菜长得更快。从过去的火山到今日餐桌的丰盛——有一条清晰的线索，任何留心的人都能看见。\n\n从广州或深圳来到这里，这片地形会带来一种冲击。珠三角让人感觉被规划、被管理、被铺设。湛江的火山地貌是不受统治的。它提醒人们：广东不仅仅是商业与高铁的省份，它也是地质力量、热带农业和被地质时间塑造的海岸线的省份。',
        }),
        JSON.stringify({ en: '80+ volcanic cones · Shaped over 1 million years', zh: '80+ 座火山锥 · 跨越 100 万年的地质塑造' }),
        JSON.stringify({ en: 'Volcanic landscape', zh: '火山地貌' }),
        'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1400&q=80',
        JSON.stringify({
          en: '"Few travellers expect to find volcanoes in Guangdong, but the Leizhou Peninsula was shaped by eruptions over the past several million years."',
          zh: '"很少有旅行者预料到会在广东发现火山。但雷州半岛是由过去数百万年的喷发塑造而成的。"',
        }),
      ],
    );
    console.log('✅ City culture sections seeded (3 sections)');
  }

  // ═══════════════════════════════════════════════════════
  // 4. Story route: A Southern Sea Table
  // ═══════════════════════════════════════════════════════
  const routeResult = await dataSource.query(
    `INSERT INTO story_routes (slug, title, culture_tag, city_name, duration, audience, summary, story, cover_image, published) VALUES
     (
       'southern-sea-table',
       $1,
       'Coastal',
       $2,
       $3,
       $4,
       $5,
       $6,
       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
       true
     )
     RETURNING id;`,
    [
      JSON.stringify({ en: 'A Southern Sea Table', zh: '一张朝南的餐桌' }),
      JSON.stringify({ en: 'Zhanjiang', zh: '湛江' }),
      JSON.stringify({ en: '1 day', zh: '1 天' }),
      JSON.stringify({ en: 'Curious travellers', zh: '好奇的旅行者' }),
      JSON.stringify({
        en: 'A one-day route through Zhanjiang: volcanic crater lake at dawn, seafood auction mid-morning, French colonial streets in the afternoon, and a sunset dinner facing the South China Sea.',
        zh: '一条湛江路线：凌晨海鲜拍卖、火山口湖、法式殖民街道，和一顿面向南海的晚餐。',
      }),
      JSON.stringify({
        en: 'This route meets Zhanjiang where the city begins — at the water. Before the factories and the highways, the sea shaped this coast. Every stop traces back to that relationship.',
        zh: '大多数人通过城市了解广东——广州的高楼、深圳的工厂。这条路线提供了另一种认识方式：通过盐、玄武岩和晨间拍卖。湛江是中国大陆最南端的城市，它的节奏由潮汐而非红绿灯决定。',
      }),
    ],
  );

  const routeId = routeResult[0]?.id;
  console.log(`✅ Route "Southern Sea Table" seeded (id: ${routeId})`);

  // ═══════════════════════════════════════════════════════
  // 5. Route stops (all 4 stops with full bilingual content)
  // ═══════════════════════════════════════════════════════
  if (routeId) {
    await dataSource.query(
      `INSERT INTO route_stops (route_id, sort_order, time, stop_name, plan, story, cultural_story, details, image, lat, lng, meal) VALUES
       ($1, 0, '08:00', $2, '', $3, $4, $5, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 21.147, 110.277, NULL),
       ($1, 1, '11:00', $6, '', $7, $8, $9, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80', 21.196, 110.404, NULL),
       ($1, 2, '14:00', $10, '', $11, $12, $13, 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80', 21.197, 110.411, NULL),
       ($1, 3, '17:30', $14, '', $15, $16, $17, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 21.249, 110.427, $18);`,
      [
        // ── Stop 0: Huguangyan Maar Lake ──
        JSON.stringify({ en: 'Huguangyan Maar Lake', zh: '湖光岩玛珥湖' }),
        JSON.stringify({
          en: 'Start at a volcanic lake formed 160,000 years ago — a UNESCO geopark, ringed by basalt cliffs and a 2.3 km walking trail.',
          zh: '从大地记忆之火开始——一个形成于16万年前的火山口湖。',
        }),
        JSON.stringify({
          en: 'Huguangyan formed roughly 160,000 years ago when rising magma met groundwater and exploded, creating a maar lake — one of only two in the world whose volcanic structure remains fully intact. It was designated a UNESCO Global Geopark in 2004.\n\nThe circular lake spans 1.8 km across, ringed by a 2.3 km walking trail. At 22 metres deep, its water level remains constant through both monsoon and drought — a phenomenon still unexplained. No frogs or snakes have ever been observed in or around the lake, and fallen leaves sink within seconds of touching the surface. Science has no definitive answers.\n\nLi Gang, a prime minister of the Southern Song Dynasty, was exiled here and wrote poems about the lake\'s still surface. Lengyan Temple on the southern shore has been an active Buddhist site since the Tang Dynasty.',
          zh: '湖光岩形成于约16万年前。岩浆上涌遇水蒸气爆发，形成了这个直径1.8公里、深22米的圆形火山口湖。2001年被认定为联合国教科文组织世界地质公园。湖水有三谜：一、落叶入水即沉；二、水位常年不变；三、湖中无蛙无蛇。中国地质学家将其命名为「玛珥湖」。宋代名将李纲被贬至此，写下「万柄风荷摇水面，四山云气绕松梢」。唐代古刹楞严寺建于湖畔峭壁之上。',
        }),
        JSON.stringify([
          { en: 'Enter the UNESCO Global Geopark at the southwest edge of the city', zh: '漫步2.3公里环湖步道，沿途有标识介绍火山地质' },
          { en: 'Walk the 2.3 km rim trail around the largest intact maar lake in the world', zh: '观察三种未解之谜：落叶即沉、水位恒常、无蛙无蛇' },
          { en: 'Step into the volcanic geology museum built into the crater wall', zh: '探访楞严寺——唐代古刹，嵌入火山岩壁' },
          { en: 'Watch leaves sink on contact — one of three phenomena science still cannot explain here', zh: '在观景台俯瞰16万年前的火山口全貌' },
        ]),

        // ── Stop 1: Dongfeng Seafood Market ──
        JSON.stringify({ en: 'Dongfeng Seafood Market', zh: '东风海鲜市场' }),
        JSON.stringify({
          en: 'Western Guangdong\'s largest seafood wholesale market. The morning catch arrives straight from the harbour.',
          zh: '湛江的一天从港口市场开始——夜里捕捞的渔获用雷州话喊价成交。',
        }),
        JSON.stringify({
          en: 'Dongfeng Market sits beside Xiashan\'s old fishing harbour, where Zhanjiang\'s fleet has docked for over a century. It is the largest seafood wholesale market in western Guangdong. The morning\'s haul travels from boat to stall in under two hours — silver pomfret on ice, mantis shrimp clicking in tubs, cuttlefish ink still wet on the concrete floor.\n\nBidding is conducted in Leizhou dialect, a branch of Min Chinese that predates Mandarin in this region. Prices are called out in a musical rhythm; regular buyers know each boat by name. Zhanjiang earned its title as China\'s Seafood Capital through geography: the warm South China Sea meets the nutrient-rich waters of the Beibu Gulf here, creating one of the richest fishing grounds on China\'s southern coast. The market\'s daily chalkboard is a seasonal calendar — spring squid, summer prawn, autumn crab, winter grouper.',
          zh: '东风市场是粤西最大的海鲜批发市场。凌晨4点，渔船渔获在这里以雷州方言拍卖——一种远比粤语古老的闽语分支。海鲜识别是一种本地艺术：蛇鲻在5月最肥美，花蟹看腹部的花纹判断雌雄。湛江之所以是「中国海鲜之都」，并非因为产量最大，而是因为广东最长的海岸线带来的品种多样性。船名常写「顺风顺水」——既是对渔获的祝福，也是对安全的祈祷。',
        }),
        JSON.stringify([
          { en: 'Enter the largest seafood wholesale market in western Guangdong', zh: '5点前抵达，观看雷州话拍卖——粤西最古老的声音之一' },
          { en: 'Follow the mid-morning auction — bids are sung in Leizhou dialect, not Mandarin', zh: '与当地渔民一起识别当日渔获：银鲳、虾蛄、墨鱼、花蟹' },
          { en: 'Learn to read the day\'s catch: silver pomfret, mantis shrimp, grouper, flower crab', zh: '走访隔壁的干货摊位，了解生晒与烤制的区别' },
          { en: 'Eat freshly shucked oysters and steamed sea perch at a stall inside the market', zh: '现场品尝生蚝——刚出水，价格比傍晚便宜一半' },
        ]),

        // ── Stop 2: Xiashan French Heritage ──
        JSON.stringify({ en: 'Xiashan French Heritage', zh: '霞山法式风情街' }),
        JSON.stringify({
          en: 'Walk the streets of Kwangchouwan, the French leased territory that governed this port from 1899 to 1945.',
          zh: '漫步在被法国租借了近半个世纪的街道上，看珊瑚石教堂在城市中心矗立。',
        }),
        JSON.stringify({
          en: 'From 1899 to 1945, Zhanjiang was not Chinese territory. It was Kwangchouwan — a French leased territory roughly the size of Hong Kong, administered from Hanoi as part of French Indochina. The French built a deep-water port, a railway, and a European quarter along what is now Haibin Avenue, calling the settlement Fort Bayard.\n\nAt its peak, fewer than 300 Europeans lived here, but their architectural imprint remains. The twin-spired Catholic church on Lüyin Road (built 1903) uses local coral stone for its walls and French stained glass for its windows — a fusion found nowhere else. The former customs house (1913), with its arched colonnade and Marseille tiles, now stands between a hotpot restaurant and a mobile phone shop.\n\nUnlike the grand colonial monuments of Shanghai\'s Bund or Guangzhou\'s Shamian, Xiashan\'s French quarter is still lived in. A former villa is now a kindergarten. The old post office is a tea house. History here is not preserved under glass — it is stacked within the everyday.',
          zh: '霞山区曾是1899年至1945年法国租借地——广州湾的核心。法国人留下的不是大型殖民建筑群，而是一种日常的、不张扬的在场感：教堂钟楼的高度刚好够渔民在海上看见、榕树根系包裹着海关大楼的墙角。珊瑚石教堂（1903年建）是全国极少数用珊瑚礁石建造的天主教教堂。这些建筑不是博物馆——它们仍然是法院、学校和住宅。遗产活在日常中，而不是被锁在玻璃后。',
        }),
        JSON.stringify([
          { en: 'Walk Haibin Avenue past the French customs house, built in 1913', zh: '参观霞山天主教堂——中国大陆罕见的珊瑚石结构，建于1903年' },
          { en: 'Visit the Catholic church — coral stone walls, French stained glass, 1903', zh: '漫步海滨路，观察法国殖民建筑与粤西生活的并置' },
          { en: 'Pass colonial villas on Dongdi Road that are now family homes', zh: '探访广州湾历史陈列馆，了解被遗忘的1899-1945租界史' },
          { en: 'Stop at the former police station, today a museum of the French period', zh: '在榕树咖啡馆停留——1850年代法国的梧桐、岭南的榕树在此同框' },
        ]),

        // ── Stop 3: Jinsha Bay & Seafood Dinner ──
        JSON.stringify({ en: 'Jinsha Bay & Seafood Dinner', zh: '金沙湾 & 海鲜晚餐' }),
        JSON.stringify({
          en: 'A seafood dinner at Jinsha Bay, where every dish traces back to a stop from earlier in the day.',
          zh: '面向南方落座——这是我们一天开始的地方，也是一天结束的方式。',
        }),
        JSON.stringify({
          en: 'The final stop is a table facing south — chaonan, the most auspicious orientation in Lingnan dining, facing the source of warmth and abundance.\n\nA Zhanjiang seafood dinner follows a ritual unchanged for centuries. It begins with a clear broth, made from the bones and shells of the day\'s catch, cleansing the palate. Then comes steamed whole fish, unadorned — the Lingnan ultimate test of freshness. No sauce can hide a fish less than perfect: the flesh should flake from the bone at the gentlest touch of chopsticks, and the eye should be clear. Garlic-steamed prawns follow, then salt-baked crab, and finally oyster congee. Every dish traces back to a place passed earlier in the day — the fish from the morning harbour, the dried oysters from a fishing village on the way, the rice grown in volcanic soil. The meal is not separate from the route. It is the route\'s final chapter, edible and specific.',
          zh: '湛江晚餐有一种顺序感：先上一碗清汤（当日海鲜的底味），然后是白灼鱼（只用海水煮，不放姜葱），接着是盐焗蟹、白灼虾，最后以蚝仔粥收尾。每道菜的出场顺序都有逻辑——从清淡到浓郁，从纯粹到复合。调味极简：好海鲜不需要佐料。这种方法可以与当天走过的路线一一对应：鱼来自早晨的市场，盐来自沿海盐田，火来自16万年前的火山。餐桌朝南——不是朝向某人，而是朝向海岸的方向。',
        }),
        JSON.stringify([
          { en: 'Reach Jinsha Bay as the late-afternoon light hits the South China Sea', zh: '品尝湛江式海鲜晚餐——清汤、白灼鱼、盐焗蟹、蚝仔粥' },
          { en: 'Walk the 4 km beachfront promenade as the city shifts from day to evening', zh: '学习朝南餐桌的仪轨：先汤后鱼、由清至浓、河鲜后于海鲜' },
          { en: 'Sit at a seaside restaurant for a Lingnan seafood dinner — multiple courses, one table', zh: '观看蚝仔粥的桌边制作——米粒开花后加蚝、姜丝、白胡椒' },
          { en: 'Each course — steamed fish, salt-baked crab, oyster congee — comes from a place passed earlier on the route', zh: '在金沙湾海滨步道散步，看渔船归港的灯火' },
        ]),
        JSON.stringify({ en: 'Seafood dinner', zh: '海鲜晚餐——清汤、白灼鱼、盐焗蟹、蚝仔粥' }),
      ],
    );
    console.log('✅ Route stops seeded (4 stops)');
  }

  // ═══════════════════════════════════════════════════════
  // 6. Route-city link
  // ═══════════════════════════════════════════════════════
  if (routeId && cityId) {
    await dataSource.query(
      `INSERT INTO route_city_links (route_id, city_id, sort_order) VALUES ($1, $2, 0)
       ON CONFLICT DO NOTHING;`,
      [routeId, cityId],
    );
    console.log('✅ Route-city link seeded');
  }

  // ═══════════════════════════════════════════════════════
  // 7. Store collection: Coastal Life Kit
  // ═══════════════════════════════════════════════════════
  const collectionResult = await dataSource.query(
    `INSERT INTO store_collections (slug, title, route_name, route_slug, image, body, sort_order, published) VALUES
     (
       'coastal-life-kit',
       $1,
       'A Southern Sea Table',
       'southern-sea-table',
       'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82',
       $2,
       0,
       true
     )
     RETURNING id;`,
    [
      JSON.stringify({ en: 'Coastal Life Kit', zh: '海岸生活套装' }),
      JSON.stringify({
        en: 'Objects from the Zhanjiang coast. Volcanic clay ceramics, maritime tools, and textiles tied to local craft traditions.',
        zh: '来自湛江海岸的器物：火山陶器、航海工具，以及与本地手工艺传统息息相关的织物。',
      }),
    ],
  );

  const collectionId = collectionResult[0]?.id;
  console.log(`✅ Store collection "Coastal Life Kit" seeded (id: ${collectionId})`);

  // ═══════════════════════════════════════════════════════
  // 8. Store product: Volcanic Soil Tea Bowl
  // ═══════════════════════════════════════════════════════
  if (collectionId) {
    await dataSource.query(
      `INSERT INTO store_products (slug, name, collection_id, price, currency, tag, image, story, material, dimensions, origin, care, gallery, stock, published) VALUES
       (
         'volcanic-soil-bowl',
         $1,
         $2,
         32.00,
         'SGD',
         $3,
         'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82',
         $4,
         $5,
         $6,
         $7,
         $8,
         ARRAY[
           'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82',
           'https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82',
           'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82'
         ],
         10,
         true
       );`,
      [
        JSON.stringify({ en: 'Volcanic Soil Tea Bowl', zh: '火山土茶碗' }),
        collectionId,
        JSON.stringify({ en: 'Handcrafted', zh: '手工制作' }),
        JSON.stringify({
          en: 'A bowl fired using clay from the Leizhou Peninsula volcanic fields, carrying the dark, rich texture of the southern coast.',
          zh: '使用雷州半岛火山田的黏土烧制而成，承载着南部海岸深色而丰饶的质感。',
        }),
        JSON.stringify({ en: 'Natural volcanic clay, lead-free matte glaze', zh: '天然火山黏土，无铅哑光釉' }),
        JSON.stringify({ en: '9cm diameter, 5cm height', zh: '直径 9cm，高 5cm' }),
        JSON.stringify({ en: 'Leizhou Peninsula, Zhanjiang', zh: '湛江·雷州半岛' }),
        JSON.stringify({ en: 'Hand wash only. Not recommended for microwave use.', zh: '建议手洗，不适用于微波炉。' }),
      ],
    );
    console.log('✅ Store product "Volcanic Soil Tea Bowl" seeded');
  }

  // ═══════════════════════════════════════════════════════
  // 9. Interpreting service modes (3 modes)
  // ═══════════════════════════════════════════════════════
  await dataSource.query(
    `INSERT INTO interpreting_service_modes (sort_order, title, price, best_for, body, includes, accent, featured) VALUES
     (0, $1, $2, $3, $4, $5, 'light', false),
     (1, $6, $7, $8, $9, $10, 'dark', true),
     (2, $11, $12, $13, $14, $15, 'light', false);`,
    [
      JSON.stringify({ en: 'City companion interpreting', zh: '城市同行口译' }),
      JSON.stringify({ en: 'From RMB 680 / half day', zh: '半天 RMB 680 起' }),
      JSON.stringify({ en: 'Best for independent visitors', zh: '适合独立游客' }),
      JSON.stringify({
        en: 'For travelers who want English support on the ground — transport, ordering, ticketing, local etiquette, and the small explanations that turn confusion into confidence.',
        zh: '需要英语现场支持的旅行者——交通、点单、购票、本地礼仪，以及将困惑转化为信心的小小解说。',
      }),
      JSON.stringify([
        { en: 'English city support', zh: '英语城市支持' },
        { en: 'Restaurant and transit help', zh: '餐厅和交通协助' },
        { en: 'Local etiquette notes', zh: '本地礼仪提示' },
      ]),
      JSON.stringify({ en: 'Story route guided support', zh: '故事路线引导' }),
      JSON.stringify({ en: 'From RMB 1,280 / half day', zh: '半天 RMB 1,280 起' }),
      JSON.stringify({ en: 'Best for route followers', zh: '适合路线探索者' }),
      JSON.stringify({
        en: 'For visitors following a LingTour route. The interpreter manages the practical side while keeping the cultural thread clear across every stop and meal.',
        zh: '跟随 LingTour 路线的旅行者。口译员在管理实际行程的同时，确保每个站点和每顿饭的文化线索清晰连贯。',
      }),
      JSON.stringify([
        { en: 'Route pacing', zh: '路线节奏把控' },
        { en: 'Stop-by-stop storytelling', zh: '逐站故事讲解' },
        { en: 'Photo and menu help', zh: '拍照和菜单协助' },
      ]),
      JSON.stringify({ en: 'Group and study visit', zh: '团组学访' }),
      JSON.stringify({ en: 'Custom pricing', zh: '定制报价' }),
      JSON.stringify({ en: 'Best for academic or corporate groups', zh: '适合学术或企业团体' }),
      JSON.stringify({
        en: 'For universities, exchange groups, and cultural programmes. Prepared schedules, bilingual coordination, and one person who keeps the day on track.',
        zh: '适用于大学、交换团体和文化项目。预设行程、双语协调，由专人确保活动顺利进行。',
      }),
      JSON.stringify([
        { en: 'Pre-trip planning', zh: '行前规划' },
        { en: 'Group coordination', zh: '团体协调' },
        { en: 'Workshop and campus support', zh: '工作坊和校园支持' },
      ]),
    ],
  );
  console.log('✅ Interpreting service modes seeded (3 modes)');

  // ═══════════════════════════════════════════════════════
  // 10. Interpreter profiles (3 profiles)
  // ═══════════════════════════════════════════════════════
  await dataSource.query(
    `INSERT INTO interpreter_profiles (sort_order, name, language, focus, helps) VALUES
     (0, $1, $2, $3, $4),
     (1, $5, $6, $7, $8),
     (2, $9, $10, $11, $12);`,
    [
      JSON.stringify({ en: 'Culture Route Lead', zh: '文化路线领队' }),
      JSON.stringify({ en: 'English / Mandarin / Cantonese support', zh: '英语 / 普通话 / 粤语' }),
      JSON.stringify({
        en: 'Guangdong city history, neighbourhood reading, food context, and keeping a route\'s story clear from the first stop to the last.',
        zh: '广东城市历史、街区解读、饮食文化背景，确保路线故事从起点到终点清晰连贯。',
      }),
      JSON.stringify([
        { en: 'Museum visits', zh: '博物馆参观' },
        { en: 'Historic streets', zh: '历史街区' },
        { en: 'Route pacing', zh: '路线节奏' },
      ]),
      JSON.stringify({ en: 'Food & Local Life Host', zh: '美食与本地生活向导' }),
      JSON.stringify({ en: 'English / Mandarin support', zh: '英语 / 普通话' }),
      JSON.stringify({
        en: 'Markets, ordering, tea etiquette, menu translation, snack streets. The small daily interactions most visitors cannot access alone.',
        zh: '市场、点餐、茶道、菜单翻译、小吃街。大多数游客无法独自体验的日常互动。',
      }),
      JSON.stringify([
        { en: 'Menus', zh: '菜单解读' },
        { en: 'Tea culture', zh: '茶文化' },
        { en: 'Market walks', zh: '市场漫步' },
      ]),
      JSON.stringify({ en: 'Study Visit Coordinator', zh: '学访协调员' }),
      JSON.stringify({ en: 'English / Mandarin support', zh: '英语 / 普通话' }),
      JSON.stringify({
        en: 'Student groups, company visits, workshops, timetable control. Bilingual coordination across several venues in one day.',
        zh: '学生团体、企业参访、工作坊、时间管理。一天内跨多个场所的双语协调。',
      }),
      JSON.stringify([
        { en: 'Schedules', zh: '行程安排' },
        { en: 'Check-ins', zh: '签到管理' },
        { en: 'Group movement', zh: '团队动线' },
      ]),
    ],
  );
  console.log('✅ Interpreter profiles seeded (3 profiles)');

  // ═══════════════════════════════════════════════════════
  // 11. FAQ (4 items)
  // ═══════════════════════════════════════════════════════
  await dataSource.query(
    `INSERT INTO interpreting_faqs (sort_order, question, answer) VALUES
     (0, $1, $2),
     (1, $3, $4),
     (2, $5, $6),
     (3, $7, $8);`,
    [
      JSON.stringify({
        en: 'Is this a tour guide or interpreting service?',
        zh: '这是导游还是口译服务？',
      }),
      JSON.stringify({
        en: 'It is cultural interpreting plus travel support. The focus is on clear communication, route pacing, local etiquette, food and venue navigation, and making the story of a place accessible to international visitors.',
        zh: '它是文化口译加旅行支持。重点是清晰沟通、路线节奏、本地礼仪、餐饮和场所引导，让国际游客能够理解每个地方的故事。',
      }),
      JSON.stringify({
        en: 'Can I book only restaurant or transport support?',
        zh: '可以只预订餐厅或交通陪同吗？',
      }),
      JSON.stringify({
        en: 'Yes. Not every visit needs a full-day route. Short support is available for food streets, hotel check-in, station transfer, or one key cultural stop.',
        zh: '可以。并非每次都需要全天路线陪同。我们提供针对美食街、酒店入住、车站接送或单个文化景点的短时支持。',
      }),
      JSON.stringify({
        en: 'Do I need to follow a LingTour route exactly?',
        zh: '我必须严格遵循 LingTour 路线吗？',
      }),
      JSON.stringify({
        en: 'No. The published routes are starting points. You can follow one closely, simplify it, combine ideas from several routes, or ask for support around your own schedule.',
        zh: '不必。发布的路线是起点。您可以紧密跟随、简化、组合多条路线的元素，或根据自己的日程安排寻求支持。',
      }),
      JSON.stringify({
        en: 'What makes this different from hiring a generic translator?',
        zh: '这与雇佣普通翻译有什么不同？',
      }),
      JSON.stringify({
        en: 'The value goes beyond language. It is local pacing, etiquette, route logic, food context, and knowing what matters culturally at each stop — so the day feels connected rather than improvised.',
        zh: '价值超越语言本身。它包括本地节奏、礼仪、路线逻辑、饮食文化背景，以及了解每个站点文化上的重要性——让这一天感觉连贯而不随意。',
      }),
    ],
  );
  console.log('✅ FAQs seeded (4 items)');

  console.log('\n🎉 Seed complete!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
