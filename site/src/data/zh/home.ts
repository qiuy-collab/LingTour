import type { Region, FeaturedRoute, CultureFeature, Testimonial, TrustMetric, HomeEntryCard } from "@/types/content";

/** Chinese region showcase */
export const zhRegionShowcase: Region[] = [
  {
    slug: "zhanjiang",
    adcode: 440800,
    name: "湛江",
    label: "南方海岸",
    summary: "海鲜市场、火山海岸线、法式殖民建筑与港口生活。",
    narrative: "在中国大陆最南端，湛江直面开阔的南海。这里的节奏由潮汐和拍卖决定，而非红绿灯。火山口湖、渔港和法式殖民街道，一天之内皆可抵达。",
    tags: ["海岸", "海鲜", "火山地貌"],
    food: "生蚝、白切鸡、海鲜粥",
    routeSlugs: ["southern-sea-table"],
    serviceLabel: "预约湛江口译",
    serviceHref: "/interpreting",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

/** Chinese featured routes */
export const zhFeaturedRoutes: FeaturedRoute[] = [
  {
    slug: "southern-sea-table",
    title: "一张朝南的餐桌",
    theme: "沿海港口生活",
    duration: "1 天",
    audience: "沿海探索者",
    description: "一条湛江路线：凌晨海鲜拍卖、火山口湖、法式殖民街道，和一顿面向南海的晚餐。",
  },
];

/** Chinese culture highlights */
export const zhCultureHighlights: CultureFeature[] = [
  {
    slug: "zhanjiang",
    title: "南方海岸",
    body: "火山海岸线、渔港、海鲜市场——中国大陆最南端的港口生活。",
  },
];

/** Chinese testimonials */
export const zhTestimonials: Testimonial[] = [
  {
    quote: "来湛江之前一无所知，离开时却明白了桌上每一道菜背后的故事。",
    name: "Lina，来自新加坡的交换生",
  },
  {
    quote: "我们的口译员不只是翻译——她解释了为什么市场拍卖听起来像在唱歌。",
    name: "Marcus，来自英国的首次访客",
  },
  {
    quote: "这条路线将美食、火山地质和殖民历史串联成了一个完整的故事弧线。",
    name: "Aya，来自东京的文化研究者",
  },
];

/** Chinese trust metrics */
export const zhTrustMetrics: TrustMetric[] = [
  { value: "1", label: "座精选城市" },
  { value: "1", label: "条故事路线" },
  { value: "1", label: "个文化系列" },
];

/** Chinese home entry cards */
export const zhHomeEntryCards: HomeEntryCard[] = [
  { id: "01", title: "文化", body: "阅读城市故事，了解每片目的地背后的美食、手工艺与日常生活。", href: "/culture" },
  { id: "02", title: "故事路线", body: "跟随围绕一个主题打造的路线——一个市场、一段海岸线、一门手艺。", href: "/routes" },
  { id: "03", title: "口译服务", body: "预约英语本地支持：交通、菜单、购票、文化背景。", href: "/interpreting" },
  { id: "04", title: "文创商城", body: "带回家与路线息息相关的好物——陶瓷、织物、有故事的小物件。", href: "/shop" },
];
