import type { City } from '@/types/city'

// ============================================
// Mock 城市数据（3条，含完整 sections 嵌套）
// ============================================

export const mockCities: City[] = [
  {
    id: 'city-001',
    slug: 'guangzhou',
    name: { zh: '广州', en: 'Guangzhou' },
    regionLabel: { zh: '珠三角', en: 'Pearl River Delta' },
    adcode: 440100,
    heroImage: 'https://picsum.photos/seed/gz-hero/1200/600',
    heroNarrative: {
      zh: '广州，一座两千年来从未关闭的港口城市。从海上丝绸之路的起点到改革开放的前沿，这座城市的脉搏始终与世界共振。',
      en: 'Guangzhou, a port city that has never closed its doors for two thousand years.',
    },
    tags: [
      { zh: '广府', en: 'Guangfu' },
      { zh: '贸易', en: 'Trade' },
    ],
    editorIntro: {
      zh: '作为岭南文化的中心，广州将千年商都的烟火气与现代都市的活力完美融合。',
      en: 'As the center of Lingnan culture, Guangzhou perfectly blends the history of a millennium-old commercial capital with the vitality of a modern metropolis.',
    },
    galleryImages: [
      'https://picsum.photos/seed/gz-gallery1/800/600',
    ],
    foodTitle: { zh: '不只是早茶', en: 'Beyond Dim Sum' },
    foodDescription: {
      zh: '广州是名副其实的美食之都。"食在广州"绝非虚言。',
      en: 'Guangzhou is truly the capital of food.',
    },
    foodImages: [
      'https://picsum.photos/seed/gz-food1/800/600',
    ],
    sections: [
      {
        id: 'sec-gz-01',
        title: { zh: '千年商都的基因', en: 'Genetics of a Millennium-Old Commercial Capital' },
        body: {
          zh: '广州的商贸基因可以追溯到秦汉时期。',
          en: 'Guangzhou\'s commercial genetics can be traced back to the Qin and Han Dynasties.',
        },
        image: 'https://picsum.photos/seed/gz-sec1/800/400',
        statLabel: { zh: '连续开放年数', en: 'Years of continuous opening' },
        statValue: { zh: '2,000+', en: '2,000+' },
        breathImage: 'https://picsum.photos/seed/gz-breath1/1200/400',
        breathQuote: {
          zh: '海上丝绸之路从这里出发，把中国带向了世界。',
          en: 'The Maritime Silk Road started here, bringing China to the world.',
        },
        sortOrder: 1,
      },
    ],
    status: 'published',
  },
]

/** 生成 UUID */
export function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
}
