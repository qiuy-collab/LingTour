type EnglishText = string;

export type ShowcaseCitySection = {
  title: EnglishText;
  body: EnglishText;
  image: string;
  images?: string[];
  statLabel?: EnglishText;
  statValue?: EnglishText;
  breathImage?: string;
  breathQuote?: EnglishText;
  sortOrder: number;
};

export type ShowcaseCity = {
  slug: string;
  name: EnglishText;
  regionLabel: EnglishText;
  heroImage: string;
  heroNarrative: EnglishText;
  tags: EnglishText[];
  editorIntro: EnglishText;
  galleryImages: string[];
  foodTitle: EnglishText;
  foodDescription: EnglishText;
  foodImages: string[];
  relatedCitySlugs: string[];
  adcode: number;
  published: boolean;
  sections: ShowcaseCitySection[];
};

export type ShowcaseRouteStop = {
  time: string;
  stopName: EnglishText;
  story: EnglishText;
  culturalStory: EnglishText;
  details: EnglishText[];
  image: string;
  images?: string[];
  lat: number | null;
  lng: number | null;
  meal?: EnglishText | null;
  hotel?: EnglishText | null;
  transit?: EnglishText | null;
  plan?: string | null;
};

export type ShowcaseRoute = {
  slug: string;
  title: EnglishText;
  cultureTag: string;
  cityName: EnglishText;
  citySlugs: string[];
  duration: EnglishText;
  audience: EnglishText;
  summary: EnglishText;
  story: EnglishText;
  coverImage: string;
  routeRegionKey: string;
  published: boolean;
  stops: ShowcaseRouteStop[];
};

export type ShowcaseHomeHighlight = {
  slug: string;
  title: EnglishText;
  body: EnglishText;
  image?: string;
};

const englishText = (en: string, _legacyZh?: string): EnglishText => en;

const IMG = {
  guangzhouHero: '/editorial/guangzhou-river-night.jpg',
  guangzhouArcade: '/editorial/guangzhou-arcade-street.jpg',
  guangzhouBreakfast: '/editorial/guangzhou-breakfast-table.jpg',
  guangzhouDimSum: '/editorial/guangzhou-dim-sum.jpg',
  shamian:
    'https://upload.wikimedia.org/wikipedia/commons/2/20/ShamianIsland.JPG',
  chenClan:
    'https://upload.wikimedia.org/wikipedia/commons/f/f3/Chen_Clan_Ancestral_Hall_2025.06_02.jpg',
  cantonTower:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Canton_Tower_20241027.jpg/3840px-Canton_Tower_20241027.jpg',
  foshanHero:
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Foshan_Ancestral_Temple_39539-Foshan_%2849042475643%29.jpg',
  foshanTemple:
    'https://upload.wikimedia.org/wikipedia/commons/5/56/Foshan_Ancestral_Temple_39545-Foshan_%2849042476728%29.jpg',
  nanfengKiln:
    'https://upload.wikimedia.org/wikipedia/commons/f/f1/Ancient-nanfeng-kiln-1.jpg',
  tongjiBridge:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Tongji%20Bridge%2C%20Foshan%201.jpg',
  chaozhouHero:
    'https://upload.wikimedia.org/wikipedia/commons/f/fb/Paifangjie_%28cropped%29.jpg',
  guangjiBridge:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Guangji_Bridge.JPG/3840px-Guangji_Bridge.JPG',
  gongfuTea:
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Gong_fu_cha.jpg',
  zhanjiangHero:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Zhanjiang_Bay_Bridge_-_20181030.jpg/3840px-Zhanjiang_Bay_Bridge_-_20181030.jpg',
  huguangyan:
    'https://commons.wikimedia.org/wiki/Special:FilePath/HuGuangYan.jpg',
  shaoguanHero:
    'https://upload.wikimedia.org/wikipedia/commons/c/c2/Shaoguan_2019-06-23.jpg',
  mountDanxia:
    'https://upload.wikimedia.org/wikipedia/commons/f/fb/39002-Danxiashan_%2848989060302%29.jpg',
  nanhuaTemple:
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/Nanhua_Temple_gate.JPG',
} as const;

export const SHOWCASE_SOURCE_LINKS = [
  'https://english.www.gov.cn/archive/chinaabc/202111/03/content_WS6182528ec6d0df57f98e3302.html',
  'https://www.whc.unesco.org/en/list/1335',
  'https://english.www.gov.cn/news/202211/30/content_WS6386db58c6d0a757729e61d0.html',
  'https://en.wikipedia.org/wiki/Guangzhou',
  'https://en.wikipedia.org/wiki/Foshan',
  'https://en.wikipedia.org/wiki/Chaozhou',
  'https://en.wikipedia.org/wiki/Zhanjiang',
  'https://en.wikipedia.org/wiki/Shaoguan',
  'https://en.wikipedia.org/wiki/Shamian',
  'https://en.wikipedia.org/wiki/Chen_Clan_Ancestral_Hall',
  'https://en.wikipedia.org/wiki/Guangji_Bridge_(Chaozhou)',
  'https://en.wikipedia.org/wiki/Gongfu_tea',
  'https://en.wikipedia.org/wiki/Foshan_Ancestral_Temple',
  'https://en.wikipedia.org/wiki/Nanfeng_Kiln',
  'https://en.wikipedia.org/wiki/Mount_Danxia',
  'https://en.wikipedia.org/wiki/Nanhua_Temple',
  'https://en.travelchina.gov.cn/sitefiles/gjly_en/html/meijing/340.shtml',
] as const;

export const SHOWCASE_CITIES: ShowcaseCity[] = [
  {
    slug: 'guangzhou',
    name: englishText('Guangzhou', '广州'),
    regionLabel: englishText('Pearl River Delta', '珠江三角洲'),
    heroImage: IMG.guangzhouHero,
    heroNarrative: englishText(
      'Guangzhou reads like a port city that never stopped improvising. The Pearl River, arcade streets, clan halls, tea rooms, and wholesale markets still share the same daily script.',
      '广州像一座从未停止即兴发挥的港口城市。珠江、骑楼街、宗祠、茶楼和批发市场，至今仍在共同书写这座城的日常。',
    ),
    tags: [
      englishText('Lingnan', '岭南'),
      englishText('Trade', '商埠'),
      englishText('Canton life', '广府日常'),
    ],
    editorIntro: englishText(
      'The city is best entered through sequence rather than checklist: first tea, then shade, then a market lane, then the river after dark. Guangzhou reveals itself in tempo.',
      '广州更适合按节奏进入，而不是按清单打卡：先饮早茶，再走骑楼，再进市场巷口，最后去看夜里的江面。它的性格藏在速度与停顿之间。',
    ),
    galleryImages: [IMG.guangzhouArcade, IMG.guangzhouHero, IMG.guangzhouBreakfast],
    foodTitle: englishText('Beyond Dim Sum', '早茶之外'),
    foodDescription: englishText(
      'Canton food culture moves from tea rooms to roast shops and produce markets. Appetite is one of the clearest ways to read the city.',
      '广州的饮食线索从茶楼延伸到烧味铺与菜市场。理解这座城市，味觉几乎是最快的入口。',
    ),
    foodImages: [IMG.guangzhouDimSum, IMG.guangzhouBreakfast],
    relatedCitySlugs: ['foshan', 'zhanjiang'],
    adcode: 440100,
    published: true,
    sections: [
      {
        sortOrder: 0,
        title: englishText('Arcade streets', '骑楼街面'),
        body: englishText(
          'The shaded qilou streets of old Guangzhou were built for heat, rain, and commerce at once. Walking under them explains how climate and trade shaped the city long before the age of malls.',
          '老广州的骑楼街同时回应了炎热、暴雨与做生意的需要。只要在檐下走一段，就能明白气候与贸易如何在商场时代之前塑造了这座城。',
        ),
        image: IMG.guangzhouArcade,
        statLabel: englishText('Street logic', '街区逻辑'),
        statValue: englishText('Shade + trade + rain cover', '遮阳 + 交易 + 避雨'),
        breathImage: IMG.guangzhouArcade,
        breathQuote: englishText(
          'Guangzhou is a city that learned to sell, shelter, and stroll in the same gesture.',
          '广州最擅长的，是把生意、避雨与散步放进同一个动作里。',
        ),
      },
      {
        sortOrder: 1,
        title: englishText('Clan halls and craft memory', '宗祠与工艺记忆'),
        body: englishText(
          'The Chen Clan Ancestral Hall was completed in 1894 and now houses the Guangdong Folk Art Museum. It is one of the clearest places to see how carving, ceramics, ironwork, and family patronage came together in late Qing Guangzhou.',
          '陈家祠建成于 1894 年，如今是广东民间工艺博物馆。木雕、灰塑、陶塑、铁艺与宗族资助怎样在晚清广州汇合，在这里看得最清楚。',
        ),
        image: IMG.chenClan,
        statLabel: englishText('Completed', '建成时间'),
        statValue: englishText('1894', '1894'),
        breathImage: IMG.chenClan,
        breathQuote: englishText(
          'In Guangzhou, the archive was never only on paper. It also survived in brick, timber, and ornament.',
          '在广州，档案从来不只存在于纸上，也留在砖木与装饰纹样之中。',
        ),
      },
      {
        sortOrder: 2,
        title: englishText('Port light on the Pearl River', '珠江港口的夜光'),
        body: englishText(
          'Guangzhou has more than 2,200 years of urban history and long served as a southern terminus of maritime exchange. The riverfront is where that long commercial memory still feels physical.',
          '广州拥有超过 2200 年的城市历史，也长期是海上交流的南方节点。站在珠江边，商埠记忆依然是有重量、有流速的。',
        ),
        image: IMG.cantonTower,
        statLabel: englishText('Urban history', '城市历史'),
        statValue: englishText('2,200+ years', '2200+ 年'),
        breathImage: IMG.guangzhouHero,
        breathQuote: englishText(
          'When the light comes on over the Pearl River, Guangzhou still looks like a place built to meet arrivals.',
          '珠江夜灯亮起时，广州依旧像一座专门迎接来客的城市。',
        ),
      },
    ],
  },
  {
    slug: 'foshan',
    name: englishText('Foshan', '佛山'),
    regionLabel: englishText('Bay Area Core', '湾区腹地'),
    heroImage: IMG.foshanHero,
    heroNarrative: englishText(
      'Foshan stands where temple culture, martial lineages, ceramics, and manufacturing share the same urban grain. It feels handmade even when the scale turns industrial.',
      '佛山是一座把庙宇文化、武术谱系、陶艺与制造业揉进同一座城市肌理里的地方。即使尺度变得工业化，它仍保留着手工的气味。',
    ),
    tags: [englishText('Craft', '手作'), englishText('Martial arts', '武术'), englishText('Kiln fire', '窑火')],
    editorIntro: englishText(
      'To understand Foshan, follow materials: clay, glaze, timber, temple stone, then the food table of nearby Shunde. The city has always been a workshop as much as a market.',
      '理解佛山，最好跟着材料走：泥土、釉色、木料、庙宇石构，再到近旁顺德的餐桌。它一直既是市场，也是工坊。',
    ),
    galleryImages: [IMG.foshanHero, IMG.nanfengKiln, IMG.tongjiBridge],
    foodTitle: englishText('Workshop City, Table City', '工坊之城，也是饭桌之城'),
    foodDescription: englishText(
      'Foshan sits beside Shunde, one of Guangdong’s strongest food traditions. Clay, metal, and cuisine all carry the same local preference for precision without display.',
      '佛山与顺德相连，身边就是广东最强势的饮食传统之一。陶、铁与吃，背后其实是同一种不张扬却极讲究的地方审美。',
    ),
    foodImages: [IMG.foshanTemple, IMG.tongjiBridge],
    relatedCitySlugs: ['guangzhou', 'chaozhou'],
    adcode: 440600,
    published: true,
    sections: [
      {
        sortOrder: 0,
        title: englishText('Zumiao and public ritual', '祖庙与公共仪式'),
        body: englishText(
          'Foshan Ancestral Temple remains the city’s most concentrated lesson in local ritual life. Temple fairs, lion dance, and martial memory all continue to gather around it.',
          '佛山祖庙依然是理解本地公共仪式生活最集中的入口。庙会、醒狮与武术记忆，今天仍不断向这里聚拢。',
        ),
        image: IMG.foshanTemple,
        statLabel: englishText('Temple district', '庙宇片区'),
        statValue: englishText('Living civic core', '活态公共中心'),
        breathImage: IMG.foshanHero,
        breathQuote: englishText(
          'Foshan never separated craftsmanship from ceremony; both still occupy the same street.',
          '佛山从未把手艺与仪式分开，它们至今还在同一条街上相遇。',
        ),
      },
      {
        sortOrder: 1,
        title: englishText('Nanfeng Kiln', '南风古灶'),
        body: englishText(
          'Nanfeng Kiln was built in the Zhengde period of the Ming dynasty and has fired Shiwan ware for more than five centuries. Few places in Guangdong make continuity feel this literal.',
          '南风古灶建于明代正德年间，连续烧制石湾陶已超过五个世纪。广东很少有地方能把“延续”这件事表现得如此直白。',
        ),
        image: IMG.nanfengKiln,
        statLabel: englishText('Continuous firing', '连续窑火'),
        statValue: englishText('500+ years', '500+ 年'),
        breathImage: IMG.nanfengKiln,
        breathQuote: englishText(
          'The kiln explains Foshan better than a slogan does: heat, repetition, and patient control.',
          '比起一句口号，窑火更能解释佛山：高温、重复，以及耐心的控制。',
        ),
      },
      {
        sortOrder: 2,
        title: englishText('Bridge crossings and city texture', '桥梁往返与城市肌理'),
        body: englishText(
          'Tongji Bridge and the old streets around it speak to Foshan as a river town before it became a manufacturing powerhouse. The city’s texture still depends on crossing water, market lanes, and temple frontage in close sequence.',
          '通济桥及其周边旧街提醒人们：在成为制造重镇之前，佛山首先是一座河网城市。它的肌理仍靠过桥、穿街、临庙这套顺序维持。',
        ),
        image: IMG.tongjiBridge,
        statLabel: englishText('Urban texture', '城市纹理'),
        statValue: englishText('River town logic', '河网城逻辑'),
        breathImage: IMG.tongjiBridge,
        breathQuote: englishText(
          'In Foshan, movement still follows waterways even when the factories are already on the horizon.',
          '在佛山，即使工厂已经出现在天际线，人的行动节奏仍旧沿着水路展开。',
        ),
      },
    ],
  },
  {
    slug: 'chaozhou',
    name: englishText('Chaozhou', '潮州'),
    regionLabel: englishText('Chaoshan Coast', '潮汕海岸'),
    heroImage: IMG.chaozhouHero,
    heroNarrative: englishText(
      'Chaozhou is where the old city, bridge engineering, tea practice, and family kitchens all remain legible at street level. The place rewards visitors who slow down enough to repeat a gesture.',
      '潮州是一座把古城街面、桥梁技艺、工夫茶和家庭厨房都保留在街道层面的城市。只有慢下来，重复一个动作，你才会真正进入它。',
    ),
    tags: [englishText('Teochew', '潮汕'), englishText('Tea culture', '工夫茶'), englishText('Ancient bridge', '古桥')],
    editorIntro: englishText(
      'This is not a city that performs heritage for the camera. It keeps using it: brewing tea, crossing the Han River, setting out marinated goose, and reopening the shop after lunch.',
      '潮州并不是一座专门为了镜头表演“非遗”的城市。它只是继续使用这些东西：泡茶、过韩江、切卤鹅、午后再开铺。',
    ),
    galleryImages: [IMG.chaozhouHero, IMG.guangjiBridge, IMG.gongfuTea],
    foodTitle: englishText('Tea First, Then the Table', '先有茶，再有饭桌'),
    foodDescription: englishText(
      'Teochew cuisine is known for clarity and knife work as much as for flavour. The meal and the tea session belong to the same social grammar.',
      '潮州菜讲究的不只是味道，还有清爽、刀工与分寸。饭桌与茶席，其实属于同一套社交语法。',
    ),
    foodImages: [IMG.gongfuTea, IMG.chaozhouHero],
    relatedCitySlugs: ['foshan', 'zhanjiang'],
    adcode: 445100,
    published: true,
    sections: [
      {
        sortOrder: 0,
        title: englishText('Guangji Bridge', '广济桥'),
        body: englishText(
          'Guangji Bridge is one of China’s four famous ancient bridges and remains the quickest way to understand Chaozhou’s confidence in engineering and exchange. The river crossing was always cultural as much as practical.',
          '广济桥被视为中国四大古桥之一，也是理解潮州工程智慧与商贸往来的最快入口。跨江这件事，在这里从来不只是交通问题。',
        ),
        image: IMG.guangjiBridge,
        statLabel: englishText('Bridge status', '桥梁地位'),
        statValue: englishText('One of China’s four famous ancient bridges', '中国四大古桥之一'),
        breathImage: IMG.guangjiBridge,
        breathQuote: englishText(
          'The bridge is a moving threshold: part monument, part infrastructure, part city memory.',
          '这座桥像一道会移动的门槛：既是古迹，也是基础设施，更是城市记忆。',
        ),
      },
      {
        sortOrder: 1,
        title: englishText('Gongfu tea', '工夫茶'),
        body: englishText(
          'Gongfu tea is not a staged ceremony here but a repeated daily method. The precision of vessel, water, and pacing gives Chaozhou conversation its own architecture.',
          '在潮州，工夫茶不是摆拍式的“仪式感”，而是被反复使用的日常方法。器具、水温与节奏的讲究，替这里的谈话搭起了自己的结构。',
        ),
        image: IMG.gongfuTea,
        statLabel: englishText('Tea method', '泡茶方法'),
        statValue: englishText('Small vessels, strong infusion, many rounds', '小器浓泡，多轮续水'),
        breathImage: IMG.gongfuTea,
        breathQuote: englishText(
          'A Chaozhou afternoon is often measured not by the clock but by how many pours are left in the pot.',
          '潮州的下午常常不是按钟点计算，而是按壶里还剩几轮茶来衡量。',
        ),
      },
      {
        sortOrder: 2,
        title: englishText('Old city after lunch', '午后的古城街巷'),
        body: englishText(
          'Paifang Street and the old city blocks show how Chaozhou keeps commerce, family life, and tourism in delicate balance. Even at its busiest, the scale stays human.',
          '牌坊街与古城街区展示了潮州如何在商业、家常生活与旅游之间维持微妙平衡。即使最热闹的时候，它的尺度依然是人的尺度。',
        ),
        image: IMG.chaozhouHero,
        statLabel: englishText('Street scale', '街区尺度'),
        statValue: englishText('Walkable old-city core', '可步行的古城核心'),
        breathImage: IMG.chaozhouHero,
        breathQuote: englishText(
          'In Chaozhou the archive is not behind glass. It is still open for business.',
          '在潮州，档案并不在玻璃柜里，而是仍在照常营业。',
        ),
      },
    ],
  },
  {
    slug: 'zhanjiang',
    name: englishText('Zhanjiang', '湛江'),
    regionLabel: englishText('Southern Coast', '南部海岸'),
    heroImage: IMG.zhanjiangHero,
    heroNarrative: englishText(
      'Zhanjiang faces the South China Sea with a working, tidal confidence. Port trade, volcanic geology, and seafood culture all stay visible within the same day.',
      '湛江面向南海，带着一种工作中的、潮汐般的自信。港口贸易、火山地貌与海鲜饮食，在同一天里都能被清楚看见。',
    ),
    tags: [englishText('Coastal', '海岸'), englishText('Seafood', '海鲜'), englishText('Volcanic coast', '火山海岸')],
    editorIntro: englishText(
      'The city should be read from shore inward: first the bay, then the market, then the traces of older colonial streets, and finally the crater landscapes further out on the peninsula.',
      '这座城市最好从海边往里读：先看海湾，再进市场，再看旧法租界留下的街面，最后走向半岛深处的火山地貌。',
    ),
    galleryImages: [IMG.zhanjiangHero, IMG.huguangyan, IMG.zhanjiangHero],
    foodTitle: englishText('The Southern Sea Table', '南海餐桌'),
    foodDescription: englishText(
      'Zhanjiang’s food culture begins with what the harbour lands at dawn and ends with how that catch is cooked, auctioned, shared, and remembered before night.',
      '湛江的饮食文化从清晨上岸的渔获开始，到夜里被烹调、竞价、分食与记住才算完整。',
    ),
    foodImages: [IMG.zhanjiangHero, IMG.huguangyan],
    relatedCitySlugs: ['guangzhou', 'chaozhou'],
    adcode: 440800,
    published: true,
    sections: [
      {
        sortOrder: 0,
        title: englishText('Huguangyan crater lake', '湖光岩玛珥湖'),
        body: englishText(
          'Huguangyan is the signature geological stop of the Leizhou Peninsula: a maar lake formed by volcanic eruption and now part of the region’s most recognisable field landscape.',
          '湖光岩是雷州半岛最具代表性的地质现场之一：火山喷发形成的玛珥湖，如今仍是这片区域最容易辨认的自然景观。',
        ),
        image: IMG.huguangyan,
        statLabel: englishText('Landscape type', '地貌类型'),
        statValue: englishText('Volcanic maar lake', '火山玛珥湖'),
        breathImage: IMG.huguangyan,
        breathQuote: englishText(
          'Before you taste the coast, Zhanjiang asks you to look at the crater that shaped its soil.',
          '在吃到海的味道之前，湛江先让你看到塑造这片土地的火山口。',
        ),
      },
      {
        sortOrder: 1,
        title: englishText('Harbour rhythm', '港口节奏'),
        body: englishText(
          'As the southernmost major port on mainland China’s coast, Zhanjiang still moves to a maritime timetable. Prices, freshness, and route planning all begin at the harbour edge.',
          '作为中国大陆海岸线上最南端的重要港口之一，湛江至今仍按海上的时间表运转。价格、新鲜度与行程安排，往往都从港边开始决定。',
        ),
        image: IMG.zhanjiangHero,
        statLabel: englishText('City posture', '城市姿态'),
        statValue: englishText('Port-facing', '向港而生'),
        breathImage: IMG.zhanjiangHero,
        breathQuote: englishText(
          'Here the market is not a backdrop. It is the city’s working pulse.',
          '在这里，市场不是背景板，而是城市真正的脉搏。',
        ),
      },
      {
        sortOrder: 2,
        title: englishText('Leizhou Peninsula terrain', '雷州半岛地势'),
        body: englishText(
          'The peninsula’s black basalt soils and open shoreline give Zhanjiang a harsher, cleaner visual language than many Pearl River cities. Its beauty comes from exposure rather than polish.',
          '雷州半岛的玄武岩土壤与开阔海岸线，让湛江比珠三角很多城市都更硬朗、更干净。它的美感来自暴露在风与潮里的状态，而不是修饰。',
        ),
        image: IMG.huguangyan,
        statLabel: englishText('Coastline mood', '海岸气质'),
        statValue: englishText('Open and weathered', '开阔而受风化'),
        breathImage: IMG.zhanjiangHero,
        breathQuote: englishText(
          'Zhanjiang never tries to look finished. That is part of why it feels real.',
          '湛江并不试图把自己打磨得“完成”，这恰恰是它真实的原因之一。',
        ),
      },
    ],
  },
  {
    slug: 'shaoguan',
    name: englishText('Shaoguan', '韶关'),
    regionLabel: englishText('Northern Gateway', '北部门户'),
    heroImage: IMG.shaoguanHero,
    heroNarrative: englishText(
      'Shaoguan opens a different chapter of Guangdong: red sandstone peaks, river valleys, and Chan Buddhist memory. It is the province’s mountain threshold rather than its coastal front room.',
      '韶关打开的是广东的另一章：丹霞赤壁、河谷地形与禅宗记忆。它更像广东的山地门槛，而不是海边客厅。',
    ),
    tags: [englishText('Mountain', '山地'), englishText('Chan Buddhism', '禅宗'), englishText('Danxia landform', '丹霞地貌')],
    editorIntro: englishText(
      'If Guangzhou teaches speed and Chaozhou teaches repetition, Shaoguan teaches relief. Distances open up; rock, water, and monastery walls start carrying the story.',
      '如果说广州教人理解速度，潮州教人理解重复，那么韶关教人的就是起伏。距离被拉开，岩壁、水路与寺院围墙开始承担叙事。',
    ),
    galleryImages: [IMG.mountDanxia, IMG.nanhuaTemple, IMG.shaoguanHero],
    foodTitle: englishText('Mountain Pace, River Appetite', '山地节奏，河谷胃口'),
    foodDescription: englishText(
      'Northern Guangdong food in Shaoguan tends toward mountain greens, river fish, preserved flavours, and a slower table. The meal matches the terrain.',
      '韶关所在的粤北饮食，更偏向山野时蔬、河鲜、腊味与慢一些的饭桌。它的味觉与地势是同频的。',
    ),
    foodImages: [IMG.mountDanxia, IMG.shaoguanHero],
    relatedCitySlugs: ['guangzhou', 'foshan'],
    adcode: 440200,
    published: true,
    sections: [
      {
        sortOrder: 0,
        title: englishText('Mount Danxia', '丹霞山'),
        body: englishText(
          'Mount Danxia was inscribed in 2010 as part of the China Danxia World Heritage Site. The red sandstone cliffs change the visual register of Guangdong immediately: erosion becomes spectacle.',
          '丹霞山于 2010 年作为“中国丹霞”世界遗产的一部分列入名录。赤红色砂岩峭壁几乎立刻改写了人们对广东的视觉想象：风化本身就成为景观。',
        ),
        image: IMG.mountDanxia,
        statLabel: englishText('UNESCO inscription', '世界遗产列入'),
        statValue: englishText('2010', '2010'),
        breathImage: IMG.mountDanxia,
        breathQuote: englishText(
          'In Shaoguan, the rock face tells the story before any guide begins to speak.',
          '在韶关，导览开口之前，岩壁已经先把故事讲出来了。',
        ),
      },
      {
        sortOrder: 1,
        title: englishText('Nanhua Temple', '南华寺'),
        body: englishText(
          'Nanhua Temple is closely associated with Huineng, the Sixth Patriarch of Chan Buddhism. It gives Shaoguan a religious and philosophical weight rare in a route usually framed only as scenery.',
          '南华寺与禅宗六祖慧能密切相关，也让韶关不只是“看风景”的地方，而是带有宗教与思想重量的行旅节点。',
        ),
        image: IMG.nanhuaTemple,
        statLabel: englishText('Chan lineage', '禅宗谱系'),
        statValue: englishText('Sixth Patriarch site', '六祖相关遗址'),
        breathImage: IMG.nanhuaTemple,
        breathQuote: englishText(
          'The mountain route pauses differently once a monastery enters the frame.',
          '当寺院进入视野之后，山地路线里的停顿方式也会随之改变。',
        ),
      },
      {
        sortOrder: 2,
        title: englishText('Northern river gateway', '北江门户'),
        body: englishText(
          'Shaoguan’s position between Guangdong, Hunan, and Jiangxi made it a passage city long before modern highways. River and mountain corridors still define its practical geography.',
          '韶关位于粤湘赣交界地带，在高速公路出现之前就已经是一座通道城市。河谷与山口直到今天仍在决定它的实际地理。',
        ),
        image: IMG.shaoguanHero,
        statLabel: englishText('Regional role', '区域角色'),
        statValue: englishText('Gateway to northern Guangdong', '粤北门户'),
        breathImage: IMG.shaoguanHero,
        breathQuote: englishText(
          'Shaoguan is less about arrival than passage, and that is exactly its character.',
          '韶关并不以“抵达感”取胜，它更像一个通道，而这正是它的性格。',
        ),
      },
    ],
  },
];

export const SHOWCASE_ROUTES: ShowcaseRoute[] = [
  {
    slug: 'guangzhou-river-arcade',
    title: englishText('Guangzhou River Arcade Walk', '广州骑楼与江岸漫行'),
    cultureTag: 'Bay Area',
    cityName: englishText('Guangzhou', '广州'),
    citySlugs: ['guangzhou'],
    duration: englishText('1 day', '1 天'),
    audience: englishText('Culture-curious visitors', '想从日常读城市的旅行者'),
    summary: englishText(
      'A day in Guangzhou that moves from colonial island edges to lineage architecture, then finishes where the Pearl River turns the whole city back into a port.',
      '这是一条从沙面岛边缘、走到宗祠建筑，再在珠江夜色里收束的广州一日路线。',
    ),
    story: englishText(
      'The route stays close to the question Guangzhou asks best: how does a trading city absorb outside influence without losing its own daily grammar?',
      '这条路线始终围绕一个广州最擅长回答的问题展开：一座商埠城市如何吸收外来影响，却不丢掉自己的日常语法？',
    ),
    coverImage: IMG.guangzhouArcade,
    routeRegionKey: 'bay-area-core',
    published: true,
    stops: [
      {
        time: '08:30',
        stopName: englishText('Shamian', '沙面'),
        story: englishText(
          'Start on Shamian, where treaties, river trade, and colonial planning once compressed themselves into one island.',
          '从沙面开始，条约史、江面贸易与殖民地规划都曾在这座小岛上高度重叠。',
        ),
        culturalStory: englishText(
          'The point is not nostalgia for foreign façades, but understanding how Guangzhou learned to translate outside pressure into local urban form.',
          '重点并不是怀旧式地看洋楼，而是理解广州如何把外部压力转译成自己的城市形态。',
        ),
        details: [
          englishText('Pearl River edge walk', '珠江边步行'),
          englishText('Colonial-era tree canopy', '殖民时期街区树冠'),
          englishText('Morning light before crowds build', '适合在人潮出现前进入'),
        ],
        image: IMG.shamian,
        lat: 23.109444,
        lng: 113.239444,
      },
      {
        time: '11:00',
        stopName: englishText('Chen Clan Ancestral Hall', '陈家祠'),
        story: englishText(
          'By late morning the route pivots from treaty history to lineage patronage and vernacular craft.',
          '临近中午，路线从通商史转向宗族赞助与地方工艺。',
        ),
        culturalStory: englishText(
          'The academy-turned-museum shows how education, clan organisation, and decorative skill were braided together in late Qing Guangzhou.',
          '这座书院改成的博物馆展示了晚清广州如何把教育、宗族组织与装饰技艺编织在一起。',
        ),
        details: [
          englishText('Wood, brick, stone, iron carving', '木雕、砖雕、石雕、铁铸并陈'),
          englishText('One of the clearest Lingnan craft archives', '岭南工艺最清晰的现场档案之一'),
        ],
        image: IMG.chenClan,
        lat: 23.129758,
        lng: 113.2405,
      },
      {
        time: '18:10',
        stopName: englishText('Pearl River promenade', '珠江夜岸'),
        story: englishText(
          'Close by the river, where Guangzhou’s long history as a southern port becomes visible again in light, ferries, and skyline layers.',
          '最后回到珠江边，在灯光、渡船与层层天际线之间，重新看见广州作为南方港口的长时段记忆。',
        ),
        culturalStory: englishText(
          'The evening riverfront is less about spectacle than continuity: the city still organises itself around arrivals, crossings, and exchange.',
          '珠江夜岸的意义不只是“好看”，而是连续性。这座城市直到今天仍围绕抵达、渡江与交换展开。',
        ),
        details: [
          englishText('Best read at blue hour', '最适合在蓝调时刻停留'),
          englishText('Pairs well with post-dinner stroll', '适合饭后步行收束'),
        ],
        image: IMG.guangzhouHero,
        lat: 23.1168,
        lng: 113.3224,
      },
    ],
  },
  {
    slug: 'southern-sea-table',
    title: englishText('A Southern Sea Table', '一张向南海展开的餐桌'),
    cultureTag: 'Coastal',
    cityName: englishText('Zhanjiang', '湛江'),
    citySlugs: ['zhanjiang'],
    duration: englishText('1 day', '1 天'),
    audience: englishText('Travellers following food through landscape', '想从地貌读到餐桌的旅行者'),
    summary: englishText(
      'Volcanic lake at dawn, market logic by noon, then a sea-facing promenade before dinner: this route lets Zhanjiang explain itself in the order it actually works.',
      '清晨先看火山湖，中午进入市场逻辑，傍晚回到面海步道，再去吃饭。这条路线按湛江真实运作的顺序让城市自己解释自己。',
    ),
    story: englishText(
      'Everything here returns to the relationship between peninsula terrain and the harbour table. The route keeps that line visible all day.',
      '这里的一切最终都会回到半岛地形与港口餐桌的关系上，而这条路线会把这根线索整天都保留下来。',
    ),
    coverImage: IMG.huguangyan,
    routeRegionKey: 'southern-sea',
    published: true,
    stops: [
      {
        time: '08:00',
        stopName: englishText('Huguangyan Maar Lake', '湖光岩玛珥湖'),
        story: englishText(
          'Begin at the crater lake so the geology arrives before the seafood does.',
          '先从火山湖开始，让地质在海鲜之前抵达。',
        ),
        culturalStory: englishText(
          'The Leizhou Peninsula is one of the places where volcanic terrain most clearly shapes the feel of southern Guangdong.',
          '雷州半岛是华南地区少数能明显感到火山地形支配生活感受的地方。',
        ),
        details: [
          englishText('Maar lake field landscape', '玛珥湖地貌现场'),
          englishText('Peninsula geology before urban traffic', '在城市交通开始之前先读地形'),
        ],
        image: IMG.huguangyan,
        lat: 21.147,
        lng: 110.277,
      },
      {
        time: '11:20',
        stopName: englishText('Dongfeng Seafood Market', '东风海鲜市场'),
        story: englishText(
          'By late morning the route moves into foam boxes, shouted prices, wet floors, and the speed of distribution.',
          '到临近中午，路线就进入泡沫箱、叫价声、湿滑地面与快速分货的节奏里。',
        ),
        culturalStory: englishText(
          'The market explains why Zhanjiang food culture is inseparable from auction, transport, and the harbour’s timing.',
          '海鲜市场说明了为什么湛江的饮食文化从来无法与竞价、运输和港口时间表分开。',
        ),
        details: [
          englishText('Freshness measured by landing time', '新鲜度按上岸时间计算'),
          englishText('The harbour sets the menu', '港口决定菜单'),
        ],
        image: IMG.zhanjiangHero,
        lat: 21.196,
        lng: 110.404,
      },
      {
        time: '17:40',
        stopName: englishText('Jinsha Bay promenade', '金沙湾海岸步道'),
        story: englishText(
          'Close with sea wind and open horizon before the dinner table begins to make sense.',
          '在晚饭开始真正变得有意义之前，先用海风和开阔视野把这一天收住。',
        ),
        culturalStory: englishText(
          'The bay is where the route shifts from labour to appetite, without ever losing sight of where the meal came from.',
          '海湾是这条路线从劳动切换到食欲的地方，但目光始终不会离开食物来自哪里。',
        ),
        details: [
          englishText('Sunset-facing finish', '面向日落收尾'),
          englishText('Best with seafood dinner reservation', '适合接续海鲜晚餐'),
        ],
        image: IMG.zhanjiangHero,
        lat: 21.249,
        lng: 110.427,
      },
    ],
  },
  {
    slug: 'chaoshan-tea-culture',
    title: englishText('Bridge, Tea, Old City', '桥、茶与古城日常'),
    cultureTag: 'Chaoshan',
    cityName: englishText('Chaozhou', '潮州'),
    citySlugs: ['chaozhou'],
    duration: englishText('1 day', '1 天'),
    audience: englishText('Visitors who want ritual without stage effects', '想看活态传统而不是表演场景的人'),
    summary: englishText(
      'Walk from old-city shopfronts to Guangji Bridge, then slow the day down inside a gongfu tea session.',
      '从古城街面出发，走到广济桥，再在一席工夫茶里把整天的速度降下来。',
    ),
    story: englishText(
      'This route treats Chaozhou not as a museum district but as a living sequence of bridge crossing, tea pouring, and storefront continuity.',
      '这条路线不会把潮州当成博物馆片区，而是把它当成过桥、冲茶、继续营业的生活序列。',
    ),
    coverImage: IMG.guangjiBridge,
    routeRegionKey: 'chaoshan-coast',
    published: true,
    stops: [
      {
        time: '09:00',
        stopName: englishText('Paifang Street', '牌坊街'),
        story: englishText(
          'Begin in the old city where shop signs, snack counters, and family trade remain at eye level.',
          '先从古城牌坊街进入，让招牌、小吃摊和家族生意以最直接的街面方式出现。',
        ),
        culturalStory: englishText(
          'The old city is important precisely because it continues to be used; preservation here is inseparable from ordinary commerce.',
          '古城的重要性恰恰在于它仍在被使用。这里的保护从来离不开日常营业。',
        ),
        details: [
          englishText('Good for morning street observation', '适合清晨观察街面节奏'),
          englishText('Pairs naturally with breakfast snacks', '可顺接早间小吃'),
        ],
        image: IMG.chaozhouHero,
        lat: 23.658,
        lng: 116.622,
      },
      {
        time: '11:00',
        stopName: englishText('Guangji Bridge', '广济桥'),
        story: englishText(
          'The route then crosses toward the bridge, the city’s most concentrated lesson in engineering and civic pride.',
          '随后转向广济桥，这是潮州最集中的工程成就与城市自信展示。',
        ),
        culturalStory: englishText(
          'The bridge is both monument and movement system, reminding visitors that trade and infrastructure were never separate here.',
          '它既是古迹，也是交通系统，提醒人们在潮州，贸易与基础设施从来没有真正分开过。',
        ),
        details: [
          englishText('Han River crossing', '横跨韩江'),
          englishText('One of China’s four famous ancient bridges', '中国四大古桥之一'),
        ],
        image: IMG.guangjiBridge,
        lat: 23.6632,
        lng: 116.6505,
      },
      {
        time: '15:30',
        stopName: englishText('Gongfu tea session', '工夫茶席'),
        story: englishText(
          'The afternoon closes not with a grand finale but with repetition: pouring, refilling, adjusting, and listening.',
          '下午并不是靠一个“大高潮”结束，而是靠重复：出汤、续水、调整、听人说话。',
        ),
        culturalStory: englishText(
          'Gongfu tea is how Chaozhou structures hospitality and pace. The route uses it as the day’s final reading frame.',
          '工夫茶塑造了潮州的待客方式与时间节奏，所以这条路线也把它当成一天最后的阅读框架。',
        ),
        details: [
          englishText('Small-pot brewing logic', '小壶浓泡逻辑'),
          englishText('Best after the bridge walk', '适合作为过桥之后的收束'),
        ],
        image: IMG.gongfuTea,
        lat: 23.665,
        lng: 116.63,
      },
    ],
  },
  {
    slug: 'foshan-kiln-and-zumiao',
    title: englishText('Kiln Fire and Temple Frontage', '窑火与祖庙街面'),
    cultureTag: 'Bay Area',
    cityName: englishText('Foshan', '佛山'),
    citySlugs: ['foshan'],
    duration: englishText('1 day', '1 天'),
    audience: englishText('Travellers interested in craft, ritual, and city texture', '关心手艺、仪式与城市肌理的人'),
    summary: englishText(
      'A Foshan day that moves from temple ritual to kiln heat, then back to the river-town street scene that ties the two together.',
      '这是一条从祖庙仪式空间走到窑火现场，再回到河网街面把两者串起来的佛山一日路线。',
    ),
    story: englishText(
      'Foshan is easiest to understand through continuity of making. The temple, the kiln, and the street all show labour turning into culture.',
      '佛山最容易通过“持续制造”来理解。祖庙、古灶与街面都在展示劳动如何转化为文化。',
    ),
    coverImage: IMG.nanfengKiln,
    routeRegionKey: 'bay-area-core',
    published: true,
    stops: [
      {
        time: '09:00',
        stopName: englishText('Foshan Ancestral Temple', '佛山祖庙'),
        story: englishText(
          'Open the route where public ritual and civic identity still concentrate most visibly.',
          '从佛山最能集中展示公共仪式与城市认同的地方开场。',
        ),
        culturalStory: englishText(
          'Lion dance, martial memory, deity worship, and tourism all continue to overlap here rather than living in separate zones.',
          '醒狮、武术记忆、神祇祭祀与旅游并没有分隔在不同区域里，而是继续在这里交叠。',
        ),
        details: [
          englishText('Temple complex and surrounding streets', '祖庙建筑群与周边街巷'),
          englishText('Useful starting point for local ritual culture', '理解本地礼俗文化的起点'),
        ],
        image: IMG.foshanTemple,
        lat: 23.035151,
        lng: 113.116307,
      },
      {
        time: '13:00',
        stopName: englishText('Nanfeng Kiln', '南风古灶'),
        story: englishText(
          'The route then enters a hotter register where continuity is measured in firing cycles rather than festivals.',
          '接着路线进入更热的维度，在这里，延续性是按烧窑轮次而不是节庆来计算的。',
        ),
        culturalStory: englishText(
          'Shiwan ceramics show Foshan as a working maker-city, not only a ceremonial one.',
          '石湾陶让人看到佛山不仅是礼俗之城，也是持续运转的制造之城。',
        ),
        details: [
          englishText('Ming-dynasty kiln site', '明代窑址'),
          englishText('Shiwan ware context', '石湾陶语境'),
        ],
        image: IMG.nanfengKiln,
        lat: 23.007222,
        lng: 113.072222,
      },
      {
        time: '17:30',
        stopName: englishText('Tongji Bridge district', '通济桥片区'),
        story: englishText(
          'Close near the bridge district where water, market circulation, and neighbourhood life bring the day back down to street level.',
          '最后回到桥区，让水路、街市流动与街坊生活把整条路线重新落回地面。',
        ),
        culturalStory: englishText(
          'The bridge reminds visitors that Foshan’s craft culture was always tied to river-town exchange, not isolated workshop labour.',
          '通济桥提醒人们，佛山的工艺文化始终系在河网商贸之上，而不是孤立的工坊劳动。',
        ),
        details: [
          englishText('River-town ending instead of museum ending', '以河网街区而不是展馆结束'),
          englishText('Best near dusk', '适合黄昏时段停留'),
        ],
        image: IMG.tongjiBridge,
        lat: 23.0302,
        lng: 113.1156,
      },
    ],
  },
  {
    slug: 'danxia-and-nanhua',
    title: englishText('Red Cliffs, Chan Quiet', '丹霞赤壁与南华静地'),
    cultureTag: 'Mountain',
    cityName: englishText('Shaoguan', '韶关'),
    citySlugs: ['shaoguan'],
    duration: englishText('1 day', '1 天'),
    audience: englishText('Visitors ready for the mountain chapter of Guangdong', '愿意进入广东山地章节的人'),
    summary: englishText(
      'A northern Guangdong route that starts with Danxia landform drama, pauses at Nanhua Temple, and ends with the river-city scale of Shaoguan.',
      '这是一条从丹霞地貌的戏剧性开始，在南华寺停顿，再以韶关河城尺度收束的粤北路线。',
    ),
    story: englishText(
      'The day is structured as a descent from geological spectacle into religious calm, then back toward the practical geography of a passage city.',
      '这一天的结构是：先看地质奇观，再进入宗教静场，最后回到一座通道城市的实际地理。',
    ),
    coverImage: IMG.mountDanxia,
    routeRegionKey: 'northern-gateway',
    published: true,
    stops: [
      {
        time: '08:30',
        stopName: englishText('Mount Danxia', '丹霞山'),
        story: englishText(
          'Open at the red cliffs so the scale of northern Guangdong arrives immediately.',
          '一开始就站到赤壁面前，让粤北的尺度立刻出现。',
        ),
        culturalStory: englishText(
          'Danxia is more than scenery: the exposed rock makes geological time feel legible and close.',
          '丹霞并不只是风景。裸露的岩体让地质时间变得清楚、可感。',
        ),
        details: [
          englishText('Part of China Danxia World Heritage Site', '中国丹霞世界遗产组成部分'),
          englishText('Best for early light and layered ridges', '适合清晨光线与山脊层次'),
        ],
        image: IMG.mountDanxia,
        lat: 25.0418,
        lng: 113.7484,
      },
      {
        time: '13:40',
        stopName: englishText('Nanhua Temple', '南华寺'),
        story: englishText(
          'The second stop exchanges cliff drama for a different kind of depth: monastery time.',
          '第二站把赤壁的戏剧性换成另一种深度，也就是寺院的时间。',
        ),
        culturalStory: englishText(
          'Because Nanhua Temple is associated with Huineng, the stop gives the route a Chan Buddhist frame instead of a purely scenic one.',
          '由于南华寺与六祖慧能相关，这一站让整条路线拥有了禅宗视角，而不是单纯的山水视角。',
        ),
        details: [
          englishText('Chan lineage context', '禅宗谱系语境'),
          englishText('Contrasts with Danxia terrain', '与丹霞地貌形成强烈对照'),
        ],
        image: IMG.nanhuaTemple,
        lat: 24.649167,
        lng: 113.631389,
      },
      {
        time: '17:30',
        stopName: englishText('Shaoguan riverfront', '韶关河岸收尾'),
        story: englishText(
          'Finish back in the city, where river corridors and transport logic remind you why Shaoguan mattered as a gateway.',
          '最后回到城里，在江岸与交通走向之间理解韶关为何长期是门户城市。',
        ),
        culturalStory: englishText(
          'The riverfront makes the day practical again. Mountains and monastery both return to the question of passage.',
          '河岸把整天重新拉回现实。山地与寺院最终都回到“通行”这个主题上。',
        ),
        details: [
          englishText('Gateway-city perspective', '通道城市视角'),
          englishText('Good closing stop before dinner', '适合作为晚餐前的收束'),
        ],
        image: IMG.shaoguanHero,
        lat: 24.8108,
        lng: 113.5972,
      },
    ],
  },
];

export const SHOWCASE_HOME_FEATURED_ROUTE_SLUGS = SHOWCASE_ROUTES.map(
  (route) => route.slug,
);

export const SHOWCASE_HOME_HIGHLIGHTS: ShowcaseHomeHighlight[] = [
  {
    slug: 'guangzhou',
    title: englishText('Guangzhou', '广州'),
    body: englishText(
      'Start with the Pearl River city where port history, tea rooms, and arcade streets are still part of everyday movement.',
      '从广州开始：这座珠江商埠至今仍把港口史、茶楼与骑楼街放在同一套日常节奏里。',
    ),
  },
  {
    slug: 'foshan',
    title: englishText('Foshan', '佛山'),
    body: englishText(
      'Follow temple frontage, kiln fire, and river-town craft across the western side of the Bay Area.',
      '从湾区西侧进入佛山：祖庙街面、古灶窑火与河网工艺会把城市一层层展开。',
    ),
  },
  {
    slug: 'chaozhou',
    title: englishText('Chaozhou', '潮州'),
    body: englishText(
      'Read the old city through bridge crossings, gongfu tea, and a food culture shaped by patience.',
      '在潮州，通过过桥、冲茶和讲究分寸的饭桌来读古城。',
    ),
  },
  {
    slug: 'zhanjiang',
    title: englishText('Zhanjiang', '湛江'),
    body: englishText(
      'Turn south to the Leizhou Peninsula, where crater lakes and harbour markets both lead to the table.',
      '向南走到雷州半岛：火山湖与港口市场都会最终把你带回餐桌。',
    ),
  },
  {
    slug: 'shaoguan',
    title: englishText('Shaoguan', '韶关'),
    body: englishText(
      'Move into Guangdong’s mountain chapter through Danxia cliffs, monasteries, and river gateways.',
      '再进入广东的山地章节：丹霞赤壁、寺院停顿与河谷门户共同定义韶关。',
    ),
  },
];
