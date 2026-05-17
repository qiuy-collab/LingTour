// ============================================
// 商城系列 Mock 数据
// ============================================
import type { StoreCollection } from '@/types/collection'

let _nextId = 1
export function generateId(): string {
  return `col-${String(_nextId++).padStart(4, '0')}`
}

export const mockCollections: StoreCollection[] = [
  {
    id: 'col-0100',
    slug: 'coastal-life-kit',
    title: '滨海生活套装',
    titleEn: 'Coastal Life Kit',
    routeName: '东海岛漫游',
    routeSlug: 'donghai-island',
    image: 'https://picsum.photos/seed/coastal/800/600',
    body: '来自湛江东海岛的精选好物，每一件都承载着海风的味道与渔民的匠心。从手工编织的渔网袋到贝壳镶嵌的首饰盒，这套滨海生活套装让你把海边的悠闲带回家。',
    bodyEn: 'Curated goods from Donghai Island, Zhanjiang. Each piece carries the scent of sea breeze and the craftsmanship of fishermen. From handwoven fishnet bags to shell-inlaid jewelry boxes, this Coastal Life Kit brings the coastal leisure home.',
    productCount: 4,
    status: 'published',
  },
  {
    id: 'col-0101',
    slug: 'chaoshan-tea-ceremony',
    title: '潮汕功夫茶系列',
    titleEn: 'Chaoshan Gongfu Tea Series',
    routeName: '古城漫步',
    routeSlug: 'chaozhou-old-town',
    image: 'https://picsum.photos/seed/tea/800/600',
    body: '潮汕功夫茶，不止是一种饮品，更是一门生活艺术。本系列精选潮州本地匠人手作的茶具、凤凰单丛茶叶与茶道配件，带你领略"茶三酒四"的潮汕待客之道。',
    bodyEn: 'Chaoshan Gongfu tea is more than a beverage — it is a living art. This series features handcrafted tea sets by Chaozhou artisans, Fenghuang Dancong tea leaves, and tea ceremony accessories, inviting you into the Chaoshan way of hospitality.',
    productCount: 3,
    status: 'published',
  },
  {
    id: 'col-0102',
    slug: 'guangfu-heritage-collection',
    title: '广府非遗传承系列',
    titleEn: 'Guangfu Heritage Collection',
    routeName: '珠江新城漫游',
    routeSlug: 'pearl-river-new-town',
    image: 'https://picsum.photos/seed/guangfu/800/600',
    body: '广府文化源远流长，从西关大屋的满洲窗到陈家祠的灰塑，每一件非遗手作都凝聚着岭南匠人的智慧与坚守。本系列精选广州及周边地区的非物质文化遗产衍生品。',
    bodyEn: 'Guangfu culture runs deep. From Manchurian windows of Xiguan mansions to the lime sculptures of Chen Clan Academy, each heritage piece embodies Lingnan craftsmanship. This series features intangible cultural heritage derivatives from Guangzhou and beyond.',
    productCount: 5,
    status: 'published',
  },
  {
    id: 'col-0103',
    slug: 'hakka-earth-essentials',
    title: '客家土楼风物',
    titleEn: 'Hakka Earth Essentials',
    routeName: '古城漫步',
    routeSlug: 'chaozhou-old-town',
    image: 'https://picsum.photos/seed/hakka/800/600',
    body: '客家文化以"耕读传家"为内核，土楼是客家人智慧的结晶。本系列精选客家地区的手工蓝染布艺、竹编器物与传统客家娘酒，让古老的客家生活美学走进现代日常。',
    bodyEn: 'Hakka culture centers on "farming and studying as family tradition," with the Tulou earthen buildings as its crown jewel. This series features hand-dyed indigo textiles, bamboo crafts, and traditional Hakka rice wine — bringing ancient Hakka aesthetics into modern life.',
    productCount: 2,
    status: 'draft',
  },
]
