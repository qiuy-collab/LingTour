import type { Route } from '@/types/route'

// ============================================
// Mock 路线数据（3条，含完整 stops 嵌套）
// ============================================

export const mockRoutes: Route[] = [
  {
    id: 'route-001',
    slug: 'zhujiang-new-town',
    title: { zh: '珠江新城：从稻田到天际线', en: 'Zhujiang New Town: From Rice Fields to Skyline' },
    cultureTag: 'Guangfu',
    cityName: { zh: '广州', en: 'Guangzhou' },
    duration: { zh: '1天', en: '1 day' },
    audience: { zh: '城市文化爱好者、摄影爱好者', en: 'Urban culture enthusiasts, photographers' },
    summary: {
      zh: '用一天时间探寻广州 CBD 背后的故事。从天河体育中心到珠江新城中轴线，见证一座城市如何在30年间从农田蜕变为世界级商务中心区。',
      en: 'Explore the stories behind Guangzhou\'s CBD in one day. From Tianhe Sports Center to the Zhujiang New Town central axis, witness how a city transformed from farmland into a world-class CBD in just 30 years.',
    },
    story: {
      zh: '珠江新城的故事是中国城市化的一个奇迹。1990年代以前，这里还是一片农田和村落。如今，它是广州乃至华南最密集的摩天大楼群所在地。我们将沿着这条3.8公里的中轴线，解读每一栋建筑背后的设计哲学和城市战略。',
      en: 'The story of Zhujiang New Town is a miracle of Chinese urbanization. Before the 1990s, this was all farmland and villages. Today, it hosts the densest cluster of skyscrapers in Guangzhou and southern China. We will walk the 3.8km central axis, decoding the design philosophy and urban strategy behind each building.',
    },
    coverImage: 'https://picsum.photos/seed/route-zjnc/800/600',
    stops: [
      {
        id: 'stop-001-1',
        sortOrder: 1,
        time: '08:30',
        stopName: { zh: '天河体育中心', en: 'Tianhe Sports Center' },
        story: {
          zh: '1987年，为迎接第六届全国运动会，广州在天河机场旧址上建起了天河体育中心。这标志着广州城市中心从越秀向天河东移的开始。',
          en: 'In 1987, to host the 6th National Games, Guangzhou built Tianhe Sports Center on the site of the former Tianhe Airport. This marked the beginning of Guangzhou\'s urban center shifting eastward from Yuexiu to Tianhe.',
        },
        culturalStory: {
          zh: '天河体育中心的设计灵感来自"天体"概念，三个场馆分别象征日、月、星。它的落成不仅带来了运动设施，更带来了基础设施的全面升级——地铁一号线、天河路商圈随之而来。可以说，没有天河体育中心，就没有今天的珠江新城。',
          en: 'Tianhe Sports Center\'s design was inspired by the "celestial bodies" concept — the three venues symbolize the sun, moon, and stars. Its completion brought not only sports facilities but comprehensive infrastructure upgrades — Metro Line 1 and the Tianhe Road commercial district followed. One could say: without Tianhe Sports Center, there would be no Zhujiang New Town today.',
        },
        details: [
          { zh: '六运会历史回顾', en: '6th National Games history' },
          { zh: '天河体育中心建筑设计解读', en: 'Tianhe Sports Center architecture' },
          { zh: '周边商圈演变', en: 'Surrounding commercial district evolution' },
        ],
        image: 'https://picsum.photos/seed/stop-tianhe/800/600',
        lat: 23.1322,
        lng: 113.3218,
        meal: { zh: '附近早茶推荐：广州酒家（体育东店）', en: 'Nearby dim sum: Guangzhou Restaurant (Tiyu Dong)' },
        hotel: { zh: '', en: '' },
        transit: { zh: '地铁1号线 体育中心站 C出口', en: 'Metro Line 1, Tianhe Sports Center Station, Exit C' },
      },
      {
        id: 'stop-001-2',
        sortOrder: 2,
        time: '10:00',
        stopName: { zh: '花城广场', en: 'Huacheng Square' },
        story: {
          zh: '花城广场是珠江新城的中轴核心，全长1.5公里，南北贯通。广场两侧分布着广州最具标志性的建筑——广州塔、东西塔、广州图书馆、广东省博物馆、广州大剧院。',
          en: 'Huacheng Square is the central axis of Zhujiang New Town, stretching 1.5km north to south. Flanking the square are Guangzhou\'s most iconic buildings — Canton Tower, East & West Towers, Guangzhou Library, Guangdong Museum, and Guangzhou Opera House.',
        },
        culturalStory: {
          zh: '花城广场的设计体现了"山水城市"的理念。北端的黄埔大道是"山"，南端的珠江是"水"，中间的广场是"城"。东西对称的建筑布局呼应了中国传统的中轴礼制，而现代建筑的大胆造型则展现了广州开放包容的城市精神。Zaha Hadid设计的广州大剧院像两颗"珠江石"，寓意这座城市从江河中诞生。',
          en: 'Huacheng Square embodies the "mountain-water-city" concept. Huangpu Avenue to the north is the "mountain," the Pearl River to the south is the "water," and the square between them is the "city." The symmetrical east-west layout echoes traditional Chinese axial planning, while the bold modern forms express Guangzhou\'s open, inclusive spirit. Zaha Hadid\'s Opera House resembles two "Pearl River stones," symbolizing a city born from the river.',
        },
        details: [
          { zh: '广州东西塔（IFC & CTF）建筑特色对比', en: 'IFC vs CTF architectural comparison' },
          { zh: '广州图书馆"之字"外观设计理念', en: 'Guangzhou Library zigzag design' },
          { zh: '广东省博物馆"宝盒"意象解读', en: 'Guangdong Museum "treasure box" concept' },
          { zh: '广州大剧院 Zaha Hadid 参数化设计', en: 'Zaha Hadid parametric Opera House design' },
        ],
        image: 'https://picsum.photos/seed/stop-huacheng/800/600',
        lat: 23.1186,
        lng: 113.3244,
        meal: { zh: '午餐推荐：花城汇地下美食广场（各国料理）', en: 'Lunch: Huachenghui underground food plaza (international cuisine)' },
        hotel: { zh: '', en: '' },
        transit: { zh: 'APM线 花城大道站 / 大剧院站', en: 'APM Line, Huacheng Avenue / Opera House Station' },
      },
      {
        id: 'stop-001-3',
        sortOrder: 3,
        time: '14:00',
        stopName: { zh: '猎德村与广州塔', en: 'Liede Village & Canton Tower' },
        story: {
          zh: '猎德村曾是广州最大的城中村之一。2007年启动改造后，村民从握手楼搬进了现代化的猎德花园。一江之隔，南岸的广州塔（小蛮腰）以600米高度定义着这座城市的新高度。',
          en: 'Liede was once one of Guangzhou\'s largest urban villages. After redevelopment began in 2007, villagers moved from cramped "handshake buildings" into modern Liede Garden. Across the river, Canton Tower rises 600m to define the city\'s new heights.',
        },
        culturalStory: {
          zh: '猎德村的改造是中国城市更新的标杆案例。它保留了李氏大宗祠等4座古建筑，在现代化社区中留住了岭南水乡的记忆。每年端午，猎德涌上的龙舟赛依然是全村最热闹的节日。而对岸的广州塔，则代表着广州"向上生长"的城市意志——600米的高度不仅是建筑标高，更是一种心理标高。',
          en: 'Liede\'s redevelopment is a benchmark case in Chinese urban renewal. It preserved four heritage buildings including the Li Clan Ancestral Hall, retaining the memory of Lingnan water towns within a modern community. Every Dragon Boat Festival, the races on Liede Stream remain the village\'s liveliest tradition. Across the river, Canton Tower represents Guangzhou\'s "growing upward" ambition — 600m is not just a structural height but a psychological benchmark.',
        },
        details: [
          { zh: '猎德村改造历程讲解', en: 'Liede redevelopment history' },
          { zh: '李氏大宗祠参观', en: 'Li Clan Ancestral Hall visit' },
          { zh: '龙舟文化体验（如逢端午）', en: 'Dragon boat culture (during festival)' },
          { zh: '广州塔登塔（可选，107层/108层观光厅）', en: 'Canton Tower observation decks (optional, floors 107/108)' },
        ],
        image: 'https://picsum.photos/seed/stop-liede/800/600',
        lat: 23.1135,
        lng: 113.3283,
        meal: { zh: '晚餐推荐：猎德涌畔私房菜或广州塔旋转餐厅', en: 'Dinner: Liede riverside private kitchen or Canton Tower revolving restaurant' },
        hotel: { zh: '推荐住宿：广州四季酒店（IFC 70-100层）或广州瑰丽酒店（CTF 93-108层）', en: 'Stay: Four Seasons Guangzhou (IFC floors 70-100) or Rosewood Guangzhou (CTF floors 93-108)' },
        transit: { zh: 'APM线 海心沙站 → 步行过猎德大桥', en: 'APM Line, Haixinsha Station → walk across Liede Bridge' },
      },
    ],
    published: true,
    citySlugs: ['shenzhen', 'foshan'],
  },
  {
    id: 'route-002',
    slug: 'donghai-island',
    title: { zh: '东海岛：南中国海的一日', en: 'Donghai Island: A Day on the South China Sea' },
    cultureTag: 'Coastal',
    cityName: { zh: '湛江', en: 'Zhanjiang' },
    duration: { zh: '1天', en: '1 day' },
    audience: { zh: '自然爱好者、海鲜美食家、摄影爱好者', en: 'Nature lovers, seafood gourmets, photographers' },
    summary: {
      zh: '从湛江市区出发，跨越东海岛大堤，在龙海天长滩上感受南海的浩瀚。探访火山遗迹、品尝即捕即煮的海鲜，体验雷州半岛最纯粹的海洋文化。',
      en: 'Depart from Zhanjiang city, cross the Donghai Island causeway, and feel the vastness of the South China Sea on Longhaitian Beach. Explore volcanic relics, taste freshly caught seafood, and experience the purest maritime culture of the Leizhou Peninsula.',
    },
    story: {
      zh: '东海岛是中国第五大岛，也是广东第一大岛。它由一条6.8公里的跨海大堤与大陆相连。岛上的龙海天沙滩长达28公里，是"中国第一长滩"。这里不仅有绝美的海岸线，还有独特的火山地貌和浓郁的渔村风情。',
      en: 'Donghai Island is China\'s fifth-largest island and Guangdong\'s largest. Connected to the mainland by a 6.8km causeway, it features Longhaitian Beach — "China\'s Longest Beach" at 28km. Beyond the stunning coastline, the island boasts unique volcanic landforms and rich fishing village culture.',
    },
    coverImage: 'https://picsum.photos/seed/route-dhd/800/600',
    stops: [
      {
        id: 'stop-002-1',
        sortOrder: 1,
        time: '08:00',
        stopName: { zh: '东海岛大堤', en: 'Donghai Island Causeway' },
        story: {
          zh: '东海岛大堤建于1958-1961年，全长6.8公里，是当时广东省最大的围垦工程。它把东海岛与大陆连为一体，也开启了东海岛的开发历程。',
          en: 'Built between 1958 and 1961, this 6.8km causeway was Guangdong\'s largest reclamation project at the time. It connected Donghai Island to the mainland and launched the island\'s development.',
        },
        culturalStory: {
          zh: '这条大堤的修建是一个时代的缩影。在没有大型机械的年代，湛江人民用肩挑手抬的方式，历时三年筑起了这座海上长龙。大堤不仅改变了东海岛的交通格局，更改变了岛上居民的生活方式——从纯渔业经济走向多元化发展。今天，驱车行驶在大堤上，两侧是无垠的海面和连片的蚝排，是湛江最具标志性的公路景观。',
          en: 'This causeway embodies an era. Without heavy machinery, the people of Zhanjiang built this sea dragon using only their shoulders and hands over three years. Beyond transforming transportation, it changed island life — from pure fishing to diversified economy. Today, driving along the causeway with endless sea and oyster farms on both sides is Zhanjiang\'s most iconic road trip.',
        },
        details: [
          { zh: '大堤建设历史回顾', en: 'Causeway construction history' },
          { zh: '沿途蚝排景观讲解', en: 'Oyster farm scenery' },
          { zh: '最佳拍摄点停留', en: 'Best photo spots' },
        ],
        image: 'https://picsum.photos/seed/stop-dadi/800/600',
        lat: 21.0305,
        lng: 110.3887,
        meal: { zh: '早餐推荐：湛江市区霞山水产品批发市场旁的海鲜粥', en: 'Breakfast: Seafood congee near Xiashan seafood market' },
        hotel: { zh: '', en: '' },
        transit: { zh: '湛江市区驾车约40分钟，经东海岛大堤', en: 'Drive ~40 min from Zhanjiang via the causeway' },
      },
      {
        id: 'stop-002-2',
        sortOrder: 2,
        time: '10:30',
        stopName: { zh: '龙海天沙滩', en: 'Longhaitian Beach' },
        story: {
          zh: '龙海天沙滩全长28公里，宽150-300米，沙质细腻洁白，是中国最长的天然沙滩。涨潮时海浪可达2米高，退潮时沙滩宽度可达300米。',
          en: 'Longhaitian Beach stretches 28km with widths of 150-300m and fine white sand — China\'s longest natural beach. Waves reach 2m at high tide, and the beach widens to 300m at low tide.',
        },
        culturalStory: {
          zh: '龙海天这个名字来源于一个古老的传说：东海龙王的太子曾在此处升天。这片沙滩不仅是大自然的杰作，也是雷州半岛海洋文化的象征。当地渔民仍保持着传统的拉大网捕鱼方式——数十人合力将数百米长的渔网从海中拉上岸，这种场景至今仍是龙海天最震撼的人文景观。',
          en: 'The name "Longhaitian" (Dragon Sea Sky) comes from an ancient legend: the Dragon King\'s prince ascended to heaven here. Beyond its natural beauty, this beach symbolizes Leizhou maritime culture. Local fishermen still practice traditional seine net fishing — dozens of people hauling hundred-meter nets ashore together — the most spectacular human landscape at Longhaitian.',
        },
        details: [
          { zh: '沙滩漫步与摄影', en: 'Beach walk & photography' },
          { zh: '传统拉大网捕鱼体验（视季节而定）', en: 'Traditional seine fishing (seasonal)' },
          { zh: '沙滩排球或飞盘（可选）', en: 'Beach volleyball or frisbee (optional)' },
          { zh: '潮间带生物观察', en: 'Intertidal zone exploration' },
        ],
        image: 'https://picsum.photos/seed/stop-longhaitian/800/600',
        lat: 20.9556,
        lng: 110.4997,
        meal: { zh: '午餐推荐：沙滩附近渔家乐，当日捕捞海鲜即煮', en: 'Lunch: Fishermen\'s home restaurant — fresh catch of the day' },
        hotel: { zh: '', en: '' },
        transit: { zh: '从大堤驾车约20分钟', en: 'Drive ~20 min from causeway' },
      },
      {
        id: 'stop-002-3',
        sortOrder: 3,
        time: '15:00',
        stopName: { zh: '硇洲岛灯塔', en: 'Naozhou Island Lighthouse' },
        story: {
          zh: '硇洲岛是一座由火山喷发形成的岛屿。岛上的硇洲灯塔建于1899年，由法国人设计建造，是世界上仅存的两座水晶磨镜灯塔之一。',
          en: 'Naozhou Island was formed by volcanic eruption. Its lighthouse, built in 1899 by French engineers, is one of only two surviving crystal-lens lighthouses in the world.',
        },
        culturalStory: {
          zh: '硇洲灯塔是湛江海疆的守护者，120多年来从未间断过发光。灯塔所用的水晶透镜由128片水晶棱镜组成，能将微弱的光源折射放大到25海里外可见。它见证了中国从清末到现代的沧桑巨变，也见证了南海航运的兴衰。岛上的火山岩柱状节理——一排排规则的六边形玄武岩柱——则是大自然亿万年地质运动留下的"签名"。',
          en: 'Naozhou Lighthouse has guarded Zhanjiang\'s waters for over 120 years without interruption. Its crystal lens, composed of 128 prisms, refracts faint light visible from 25 nautical miles. The lighthouse has witnessed China\'s transformation from the late Qing era to modernity, along with the rise and fall of South China Sea shipping. The island\'s columnar basalt joints — rows of hexagonal pillars — are nature\'s billion-year geological signature.',
        },
        details: [
          { zh: '硇洲灯塔历史讲解', en: 'Lighthouse history' },
          { zh: '火山岩柱状节理地貌观察', en: 'Columnar basalt observation' },
          { zh: '岛上渔港拍摄', en: 'Fishing port photography' },
          { zh: '灯塔日落（约17:30）', en: 'Lighthouse sunset (~17:30)' },
        ],
        image: 'https://picsum.photos/seed/stop-naozhou/800/600',
        lat: 20.8753,
        lng: 110.6089,
        meal: { zh: '岛上晚餐推荐：渔港旁海鲜大排档（龙虾、鲍鱼、海胆）', en: 'Dinner: Harbor-side seafood stalls (lobster, abalone, sea urchin)' },
        hotel: { zh: '如需过夜：硇洲岛民宿或返回湛江市区', en: 'Overnight: Naozhou B&B or return to Zhanjiang' },
        transit: { zh: '从东海岛东南码头乘渡轮约30分钟（每小时一班）', en: 'Ferry ~30 min from Donghai southeast pier (hourly)' },
      },
    ],
    published: true,
  },
  {
    id: 'route-003',
    slug: 'ancient-city-walk',
    title: { zh: '古城漫步：潮州慢时光', en: 'Ancient City Walk: Slow Time in Chaozhou' },
    cultureTag: 'Chaoshan',
    cityName: { zh: '潮州', en: 'Chaozhou' },
    duration: { zh: '半天', en: 'Half day' },
    audience: { zh: '文化探索者、手工艺爱好者、美食体验者', en: 'Culture explorers, craft lovers, food enthusiasts' },
    summary: {
      zh: '穿梭于潮州古城牌坊街，探访木雕、潮绣、手拉壶工坊。在广济桥上感受"十八梭船"的智慧，在工夫茶馆里读懂潮人精神。',
      en: 'Wander through Chaozhou\'s ancient Paifang Street, visit woodcarving, embroidery, and teapot workshops. Experience the wisdom of "eighteen shuttle boats" on Guangji Bridge and understand the Chaoshan spirit in a Gongfu tea house.',
    },
    story: {
      zh: '潮州古城是中国保存最完整的古代府城之一。2.3平方公里的古城内，保留了720多条街巷和大量明清时期的祠堂、庙宇、牌坊。这不是一座被圈起来的"古城景区"，而是一座依然活着的、有温度的城市。',
      en: 'Chaozhou Ancient City is one of China\'s best-preserved prefectural cities. Within 2.3 sq km, over 720 lanes and numerous Ming-Qing ancestral halls, temples, and memorial arches remain. This is not a cordoned-off "heritage zone" — it\'s a living, breathing city with warmth.',
    },
    coverImage: 'https://picsum.photos/seed/route-czgc/800/600',
    stops: [
      {
        id: 'stop-003-1',
        sortOrder: 1,
        time: '09:00',
        stopName: { zh: '牌坊街', en: 'Paifang Street' },
        story: {
          zh: '潮州牌坊街（太平路）全长1948米，集中了39座明清石牌坊，是中国牌坊最密集的老街。这些牌坊多为表彰科举、忠孝、节义而建，是古代潮州人文鼎盛的实物见证。',
          en: 'Chaozhou Paifang Street (Taiping Road) stretches 1,948m with 39 Ming-Qing stone memorial arches — China\'s densest concentration. Built to honor scholarly achievement, loyalty, filial piety, and virtue, they embody ancient Chaozhou\'s cultural flourishing.',
        },
        culturalStory: {
          zh: '每一座牌坊背后都有一个故事。比如"状元坊"是为明代状元林大钦而立，他出身贫寒，靠放牛自学成才，23岁中状元。潮州人"爱拼才会赢"的精神，在几百年前就已经刻在了石头上。漫步牌坊街，不仅是看建筑，更是在读一部立体的潮州人文史。沿街的老字号——胡荣泉的春饼、开元寺旁的素菜馆、深巷里的牛肉丸店——都是活着的文化遗产。',
          en: 'Behind every arch lies a story. The "Top Scholar Arch" honors Lin Daqin, a Ming Dynasty top scholar born into poverty who studied by himself while herding cattle and earned the title at age 23. The Chaoshan spirit of "only through striving can you win" was carved in stone centuries ago. Walking Paifang Street is not just sightseeing — it\'s reading a three-dimensional cultural history. The heritage shops — Hu Rongquan spring rolls, vegetarian restaurants near Kaiyuan Temple, beef ball shops in hidden alleys — are living cultural heritage.',
        },
        details: [
          { zh: '重点牌坊解读（状元坊、四进士坊等5-6座）', en: 'Key arch interpretation (5-6 arches)' },
          { zh: '探访沿街老字号', en: 'Heritage shop visits' },
          { zh: '路边潮州小吃品尝', en: 'Street food tasting' },
          { zh: '骑楼建筑细节拍摄', en: 'Qilou architecture photography' },
        ],
        image: 'https://picsum.photos/seed/stop-paifang/800/600',
        lat: 23.6683,
        lng: 116.6447,
        meal: { zh: '推荐：胡荣泉春饼 + 路边老牌牛肉丸粿条', en: 'Recommend: Hu Rongquan spring rolls + beef ball rice noodles' },
        hotel: { zh: '', en: '' },
        transit: { zh: '步行区域，机动车禁行', en: 'Pedestrian zone, no vehicles' },
      },
      {
        id: 'stop-003-2',
        sortOrder: 2,
        time: '13:30',
        stopName: { zh: '广济楼与广济桥', en: 'Guangji Tower & Guangji Bridge' },
        story: {
          zh: '广济桥建于南宋乾道七年（1171年），是中国四大古桥之一。全长518米，由东西两段石梁桥和中间一段浮桥组成。"十八梭船廿四洲"的独特结构，在世界桥梁史上绝无仅有。',
          en: 'Built in 1171 (Southern Song Dynasty), Guangji Bridge is one of China\'s four great ancient bridges. At 518m, it combines stone beam bridges on both ends with a floating pontoon bridge in the middle. Its unique "18 shuttle boats, 24 islets" structure is unparalleled in world bridge history.',
        },
        culturalStory: {
          zh: '广济桥的设计蕴含着深刻的智慧。中间的浮桥可以在需要时解开让大型船只通过，这使它成为世界上最早的启闭式桥梁。桥上的24座亭台楼阁不仅是景观，更是古代桥市的一部分——商贩在桥上摆摊，桥成了水上集市。韩愈被贬潮州时曾在此留下足迹，桥因此别名"湘子桥"，寄托了潮州人对这位"文起八代之衰"的大文豪的敬仰。',
          en: 'Guangji Bridge embodies profound wisdom. The central floating section can be opened for large vessels — making it the world\'s earliest open-close bridge. The 24 pavilions weren\'t just scenic — they formed an ancient bridge market where vendors sold goods on the water. Han Yu, the great Tang Dynasty writer exiled to Chaozhou, left his mark here, giving the bridge its alternate name "Xiangzi Bridge" — a tribute from Chaozhou people to the literary giant who "revived prose after eight dynasties of decline."',
        },
        details: [
          { zh: '广济楼城楼登览（俯瞰韩江全景）', en: 'Guangji Tower ascent (Han River panorama)' },
          { zh: '广济桥全程漫步（约30分钟）', en: 'Full bridge walk (~30 min)' },
          { zh: '"鉎牛"传说讲解（桥上的铁牛）', en: '"Iron Ox" legend on the bridge' },
          { zh: '韩江两岸风光拍摄', en: 'Han River scenery photography' },
        ],
        image: 'https://picsum.photos/seed/stop-guangji/800/600',
        lat: 23.6703,
        lng: 116.6518,
        meal: { zh: '下午茶：牌坊街工夫茶馆（体验21道泡茶工序）', en: 'Afternoon tea: Paifang Street Gongfu tea house (21-step ritual)' },
        hotel: { zh: '', en: '' },
        transit: { zh: '从牌坊街步行约10分钟', en: '10-min walk from Paifang Street' },
      },
    ],
    published: true,
    citySlugs: ['shantou', 'jieyang'],
  },
]

/** 生成 UUID */
export function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
}
