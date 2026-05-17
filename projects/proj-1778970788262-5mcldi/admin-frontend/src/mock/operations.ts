// ============================================
// 运营内容管理 Mock 数据
// 包含: 活动(3) + 社区帖子(5) + 首页配置(1)
// ============================================
import type { Event } from '@/types/event'
import type { CommunityPost } from '@/types/community'
import type { HomeConfig } from '@/types/home'

// ─── ID 生成器 ──────────────────────────────────
let _eventId = 50
let _postId = 60

export function generateEventId(): string {
  return 'event_' + String(_eventId++)
}
export function generatePostId(): string {
  return 'post_' + String(_postId++)
}

// ─── 活动 Mock (3条，不同状态) ─────────────────────
export const mockEvents: Event[] = [
  {
    id: 'event_1',
    title: { zh: '潮汕功夫茶文化节', en: 'Chaoshan Kungfu Tea Festival' },
    date: '2026-06-15',
    endDate: '2026-06-18',
    city: '潮州',
    citySlug: 'chaozhou',
    adcode: 445102,
    tags: ['茶文化', '非遗', '体验'],
    summary: {
      zh: '四天沉浸式体验潮汕功夫茶文化，跟随非遗传承人学习制茶、泡茶技艺。',
      en: 'A four-day immersive experience of Chaoshan Kungfu Tea culture, learning tea-making and brewing techniques with intangible heritage masters.',
    },
    description: {
      zh: '潮汕功夫茶文化节是岭南地区最具影响力的茶文化盛会之一。活动期间，您将有机会：\n\n• 参观百年茶园，了解单丛茶的种植与采摘\n• 跟随国家级非遗传承人学习传统制茶工艺\n• 体验正宗功夫茶二十一式冲泡流程\n• 品鉴不同年份、不同海拔的凤凰单丛\n• 参与茶席设计比赛，展示你的创意\n\n更有茶道表演、茶艺讲座、茶器展览等丰富多彩的配套活动。',
      en: 'The Chaoshan Kungfu Tea Festival is one of the most influential tea culture events in the Lingnan region. During the festival, you will have the opportunity to:\n\n• Visit century-old tea gardens and learn about Dancong tea cultivation\n• Follow national-level intangible heritage masters in traditional tea-making\n• Experience the authentic 21-step Kungfu Tea brewing ritual\n• Taste Phoenix Dancong teas from different years and altitudes\n• Participate in tea table design competitions\n\nAdditional activities include tea ceremony performances, lectures, and tea ware exhibitions.',
    },
    relatedRouteSlugs: ['chaoshan-tea-culture'],
    image: 'https://picsum.photos/800/400?random=101',
    status: 'upcoming',
  },
  {
    id: 'event_2',
    title: { zh: '广府龙舟邀请赛', en: 'Guangfu Dragon Boat Invitational' },
    date: '2026-05-20',
    endDate: '2026-05-22',
    city: '广州',
    citySlug: 'guangzhou',
    adcode: 440100,
    tags: ['龙舟', '端午节', '体育'],
    summary: {
      zh: '粤港澳大湾区12支龙舟队齐聚珠江，三天激烈角逐展现岭南水乡魅力。',
      en: 'Twelve dragon boat teams from the Greater Bay Area gather on the Pearl River for three days of competition, showcasing Lingnan water town charm.',
    },
    description: {
      zh: '一年一度的广府龙舟邀请赛将在珠江广州段举行。来自粤港澳大湾区的12支龙舟队伍将展开激烈角逐。\n\n活动亮点：\n• 传统龙舟点睛仪式\n• 500米直道竞速赛\n• 龙舟文化展览\n• 现场粽子和岭南美食市集\n• 亲子龙舟体验区\n\n龙舟赛不仅是一项体育竞技，更是广府地区传承千年的文化符号。',
      en: 'The annual Guangfu Dragon Boat Invitational will be held on the Pearl River\'s Guangzhou section. Twelve teams from the Greater Bay Area will compete fiercely.\n\nHighlights:\n• Traditional dragon boat eye-dotting ceremony\n• 500m straight-course racing\n• Dragon boat culture exhibition\n• On-site zongzi and Lingnan food market\n• Family dragon boat experience zone\n\nDragon boat racing is not just a sport — it is a cultural symbol passed down for millennia in the Guangfu region.',
    },
    relatedRouteSlugs: ['guangzhou-culture-walk'],
    image: 'https://picsum.photos/800/400?random=102',
    status: 'ongoing',
  },
  {
    id: 'event_3',
    title: { zh: '湛江海鲜美食博览会', en: 'Zhanjiang Seafood Gourmet Expo' },
    date: '2026-04-05',
    endDate: '2026-04-08',
    city: '湛江',
    citySlug: 'zhanjiang',
    adcode: 440800,
    tags: ['美食', '海鲜', '博览会'],
    summary: {
      zh: '汇聚粤西沿海最新鲜的海产，几十家本地渔港直供，现场烹饪大赛精彩纷呈。',
      en: 'Bringing together the freshest seafood from western Guangdong\'s coast, dozens of local fishing ports supplying directly, with exciting live cooking competitions.',
    },
    description: {
      zh: '湛江海鲜美食博览会已成功举办五届，是粤西地区规模最大的美食盛会。\n\n本届亮点：\n• 60+家渔港直供展位，价格低于市场30%\n• 名厨现场烹饪秀，教你做地道湛江菜\n• 海鲜烹饪大赛（专业组/业余组）\n• 渔港夜宴——在码头旁享用现捕海鲜\n• 亲子海洋科普互动区\n\n湛江拥有广东最长的海岸线和最丰富的海洋资源，这里的海鲜以鲜、甜、嫩著称。',
      en: 'The Zhanjiang Seafood Gourmet Expo has been successfully held for five editions and is western Guangdong\'s largest food event.\n\nThis year\'s highlights:\n• 60+ direct-from-port booths with prices 30% below market\n• Celebrity chef cooking shows teaching authentic Zhanjiang dishes\n• Seafood cooking competition (pro/amateur divisions)\n• Port night banquet — enjoy freshly caught seafood by the dock\n• Family marine science interactive zone\n\nZhanjiang boasts Guangdong\'s longest coastline and richest marine resources — its seafood is renowned for freshness, sweetness, and tenderness.',
    },
    relatedRouteSlugs: ['zhanjiang-coastal'],
    image: 'https://picsum.photos/800/400?random=103',
    status: 'past',
  },
]

// ─── 社区帖子 Mock (5条，不同频道/状态) ────────────
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post_1',
    userName: '林小明',
    userHandle: 'xiaoming_lin',
    userAvatar: 'https://picsum.photos/100/100?random=201',
    image: 'https://picsum.photos/800/500?random=202',
    title: '潮州古城里的百年茶铺',
    excerpt: '在牌坊街拐角处发现一家传承四代的老茶铺，老板说他们的凤凰单丛都是自家茶园采摘的。',
    content: '在牌坊街拐角处发现一家传承四代的老茶铺，门面不大，却摆满了各种年份的凤凰单丛。\n\n老板姓黄，是第四代传人。他说他们家从曾祖父那辈就开始做茶，茶园在凤凰山上，海拔600多米。\n\n黄老板泡了一壶蜜兰香单丛给我们尝。第一泡花香扑鼻，第二泡回甘悠长，果然是高山好茶。他说好的单丛"七泡有余香"，我们试了试，果然到第八泡还有余韵。\n\n临走时买了一罐去年的雪片，黄老板还送了一小包鸭屎香让我们试试。这种人情味，是连锁茶饮店里永远找不到的。',
    location: '潮州古城',
    route: 'chaoshan-tea-culture',
    date: '2026-05-10',
    channel: 'FoodMap',
    mood: '温暖',
    tags: ['潮州', '功夫茶', '凤凰单丛', '老字号'],
    likes: 128,
    comments: 23,
    saves: 45,
    status: 'published',
  },
  {
    id: 'post_2',
    userName: 'Emma Wilson',
    userHandle: 'emma_explores',
    userAvatar: 'https://picsum.photos/100/100?random=203',
    image: 'https://picsum.photos/800/500?random=204',
    title: 'Walking through the hidden alleys of Shamian Island',
    excerpt: 'Beyond the main boulevard, I found a network of quiet lanes with stunning colonial architecture and stories whispered in the breeze.',
    content: 'Everyone who visits Guangzhou goes to Shamian Island. But most stay on the main boulevard, take their photos of the colonial buildings, and leave.\n\nI decided to wander into the smaller alleys — and found something magical.\n\nThere\'s an old banyan tree near Lane 5 whose aerial roots have grown through the windows of an abandoned mansion. Local elders play xiangqi (Chinese chess) under its shade every afternoon. They invited me to watch and even taught me a few moves.\n\nFurther down, I discovered a tiny coffee shop run by a retired professor who speaks perfect English. He told me stories about Shamian during the 1920s, when it was the center of foreign trade in southern China.\n\nThis is what I love about Guangdong — the layers of history are everywhere, you just need to wander off the main path.',
    location: '广州沙面',
    route: 'guangzhou-culture-walk',
    date: '2026-05-12',
    channel: 'FieldNotes',
    mood: '好奇',
    tags: ['沙面', '历史建筑', '广州', '本地生活', 'Hidden Gems'],
    likes: 256,
    comments: 47,
    saves: 89,
    status: 'published',
  },
  {
    id: 'post_3',
    userName: '陈志远',
    userHandle: 'zhiyuan_c',
    userAvatar: 'https://picsum.photos/100/100?random=205',
    image: 'https://picsum.photos/800/500?random=206',
    title: '梅州客家围龙屋——一座活着的历史博物馆',
    excerpt: '走进梅县一座有200年历史的围龙屋，里面还住着同一家族的五代人。',
    content: '周末和朋友去了梅县松口镇，探访了一座清代的围龙屋。\n\n这座围龙屋建于清嘉庆年间，呈半月形，前有半月塘，后有围龙，是典型的客家民居格局。最让我惊讶的是，里面还住着同一家族的五代人！\n\n最年长的阿婆已经92岁了，她说她出生在这座围龙屋里，从没离开过。她给我们讲了这座围龙屋的历史：抗战时期曾掩护过游击队，文革时期祠堂里的牌位被族人偷偷藏在地窖里才保存下来。\n\n阿婆还给我们做了客家酿豆腐和梅菜扣肉，用的还是土灶和柴火。那种柴火饭的香气，是任何米其林餐厅都复制不出来的。\n\n临走时阿婆说：年轻人要多回来看看，不然这些老房子和老故事，就真的要消失了。',
    location: '梅州松口镇',
    route: 'hakka-earth-buildings',
    date: '2026-05-08',
    channel: 'HiddenStop',
    mood: '感动',
    tags: ['梅州', '客家', '围龙屋', '古建筑', '家族故事'],
    likes: 189,
    comments: 34,
    saves: 67,
    status: 'published',
  },
  {
    id: 'post_4',
    userName: 'Sarah Thompson',
    userHandle: 'sarah_lingnan',
    userAvatar: 'https://picsum.photos/100/100?random=207',
    image: 'https://picsum.photos/800/500?random=208',
    title: 'The Lingnan architecture language: more than just qilou',
    excerpt: 'A deep dive into the architectural elements that define Guangdong\'s unique building style, from wok-handle roofs to oyster-shell walls.',
    content: 'When people think of Lingnan architecture, they usually picture qilou (骑楼) — those beautiful arcaded buildings along Guangzhou\'s Enning Road. But there\'s so much more to the story.\n\nI spent last month documenting architectural details across Guangzhou, Foshan, and Kaiping, and here are three features you probably haven\'t noticed:\n\n1. **Wok-handle roofs (镬耳山墙)**: Those distinctive U-shaped gable walls you see on ancestral halls are shaped like the handles of a Chinese wok. They\'re not just decorative — the raised ends were designed as firebreaks in the dense village layouts of the Pearl River Delta.\n\n2. **Oyster-shell walls (蚝壳墙)**: In Shunde and parts of Zhuhai, some old houses have walls made entirely from oyster shells embedded in lime mortar. They\'re incredibly durable (some are 600+ years old), naturally insulated, and shimmer beautifully in the Guangdong sun.\n\n3. **Grey brick carving (灰塑)**: On the roof ridges of Chen Clan Academy, you\'ll find intricate 3D sculptures made from lime mortar mixed with sugar, tung oil, and glutinous rice paste. This technique is unique to Lingnan and was listed as national intangible heritage in 2008.\n\nLingnan architecture is a dialogue between the region\'s humid climate, maritime trade history, and deep-rooted clan culture. Every detail has a purpose.',
    location: '广州/佛山/开平',
    route: 'guangzhou-culture-walk',
    date: '2026-05-15',
    channel: 'CultureDesk',
    mood: '求知',
    tags: ['岭南建筑', '文化遗产', '骑楼', '蚝壳墙', '灰塑'],
    likes: 312,
    comments: 58,
    saves: 142,
    status: 'published',
  },
  {
    id: 'post_5',
    userName: '张美玲',
    userHandle: 'meiling_zhang',
    userAvatar: 'https://picsum.photos/100/100?random=209',
    image: 'https://picsum.photos/800/500?random=210',
    title: '湛江硇洲岛的灯塔与火山岩',
    excerpt: '硇洲岛是中国最大的火山岛，岛上的灯塔已守望南海120年。',
    content: '端午假期去了一趟湛江硇洲岛，这里是中国最大的火山岛，也是中国三大灯塔之一的硇洲灯塔所在地。\n\n硇洲灯塔建于1899年，由法国人设计，全部用花岗岩砌成。120多年过去了，它依然在为南海的船只指引方向。爬上塔顶，可以360度俯瞰整个岛屿和碧蓝的南海。\n\n岛上的火山岩地貌非常壮观。那晏湾的柱状节理岩，像一排排巨大的管风琴竖立在海岸边，是几万年前火山喷发后岩浆冷却形成的。退潮时可以在岩缝里找到小螃蟹和海胆。\n\n午饭在岛上的渔家乐吃的，刚上岸的杂鱼汤、白灼虾、蒜蓉蒸生蚝，人均才60块。湛江的海鲜真的是广东最好吃的（不接受反驳😄）。\n\n一个小建议：最好在岛上住一晚，看灯塔在夜幕中亮起的那一刻，真的很震撼。',
    location: '湛江硇洲岛',
    route: 'zhanjiang-coastal',
    date: '2026-05-16',
    channel: 'HiddenStop',
    mood: '惊叹',
    tags: ['湛江', '硇洲岛', '灯塔', '火山岩', '海鲜'],
    likes: 67,
    comments: 12,
    saves: 28,
    status: 'pending_review',
  },
]

// ─── 首页配置 Mock ──────────────────────────────
export const mockHomeConfig: HomeConfig = {
  heroStats: [
    {
      title: { zh: '12+', en: '12+' },
      description: { zh: '深度探索城市', en: 'Cities Explored' },
    },
    {
      title: { zh: '40+', en: '40+' },
      description: { zh: '精心设计路线', en: 'Curated Routes' },
    },
    {
      title: { zh: '200+', en: '200+' },
      description: { zh: '本地文化达人', en: 'Local Culture Guides' },
    },
    {
      title: { zh: '5000+', en: '5000+' },
      description: { zh: '满意旅客', en: 'Happy Travelers' },
    },
  ],
  trustMetrics: [
    { value: '100%', label: { zh: '本地团队', en: 'Local Team' } },
    { value: '24/7', label: { zh: '旅行支持', en: 'Travel Support' } },
    { value: '4.9/5', label: { zh: '用户评分', en: 'User Rating' } },
  ],
  entryCards: [
    {
      title: { zh: '城市文化', en: 'City Culture' },
      description: { zh: '深入岭南城市肌理，读懂每一座城', en: 'Dive into Lingnan urban fabric, understand each city' },
      image: 'https://picsum.photos/400/300?random=301',
      link: '/culture',
    },
    {
      title: { zh: '故事路线', en: 'Story Routes' },
      description: { zh: '围绕单一主题的沉浸式旅行体验', en: 'Immersive single-theme travel experiences' },
      image: 'https://picsum.photos/400/300?random=302',
      link: '/routes',
    },
    {
      title: { zh: '口译陪同', en: 'Interpreting' },
      description: { zh: '英语本地陪同，沟通零障碍', en: 'English local companion, zero barrier communication' },
      image: 'https://picsum.photos/400/300?random=303',
      link: '/interpreting',
    },
    {
      title: { zh: '文创商城', en: 'Shop' },
      description: { zh: '把岭南文化带回家', en: 'Bring Lingnan culture home' },
      image: 'https://picsum.photos/400/300?random=304',
      link: '/shop',
    },
  ],
  featuredRoutes: [
    'chaoshan-tea-culture',
    'guangzhou-culture-walk',
    'zhanjiang-coastal',
  ],
  cultureHighlights: [
    {
      title: { zh: '潮汕功夫茶', en: 'Chaoshan Kungfu Tea' },
      description: { zh: '二十一式冲泡，一杯茶里的千年功夫', en: '21-step brewing ritual — a thousand years of mastery in one cup' },
      image: 'https://picsum.photos/600/400?random=401',
      citySlug: 'chaozhou',
    },
    {
      title: { zh: '广府骑楼', en: 'Guangfu Qilou' },
      description: { zh: '岭南建筑独特的骑楼文化长廊', en: 'The unique arcaded architecture corridor of Lingnan' },
      image: 'https://picsum.photos/600/400?random=402',
      citySlug: 'guangzhou',
    },
    {
      title: { zh: '湛江海岸', en: 'Zhanjiang Coast' },
      description: { zh: '中国大陆最南端的火山海岸线', en: 'The volcanic coastline at the southernmost tip of mainland China' },
      image: 'https://picsum.photos/600/400?random=403',
      citySlug: 'zhanjiang',
    },
  ],
  testimonials: [
    {
      quote: { zh: '在凌云游的帮助下，我第一次真正走进了广东的文化深处，而不仅仅是观光。', en: 'With LingTour\'s help, I truly walked into the cultural depth of Guangdong for the first time, not just sightseeing.' },
      author: { zh: '李女士', en: 'Ms. Li' },
      avatar: 'https://picsum.photos/80/80?random=501',
    },
    {
      quote: { zh: '潮汕功夫茶文化路线改变了我对旅行的理解。强烈推荐！', en: 'The Chaoshan tea culture route changed my understanding of what travel can be. Highly recommended!' },
      author: { zh: 'James K.', en: 'James K.' },
      avatar: 'https://picsum.photos/80/80?random=502',
    },
    {
      quote: { zh: '口译员不仅翻译语言，更像是一位文化向导，让我们的商务考察变得异常顺利。', en: 'The interpreter was not just a translator, but more like a cultural guide, making our business trip exceptionally smooth.' },
      author: { zh: '王总', en: 'Mr. Wang' },
      avatar: 'https://picsum.photos/80/80?random=503',
    },
  ],
}
