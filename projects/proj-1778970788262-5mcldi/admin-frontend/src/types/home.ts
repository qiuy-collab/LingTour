// ============================================
// 首页内容管理 TypeScript 类型定义
// ============================================

export interface HeroStat {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
}

export interface TrustMetric {
  value: string
  label: string
  labelEn: string
}

export interface EntryCard {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  link: string
}

export interface CultureHighlight {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  citySlug: string
}

export interface Testimonial {
  quote: string
  quoteEn: string
  author: string
  authorEn: string
  avatar: string
}

export interface HomeConfig {
  heroStats: HeroStat[]
  trustMetrics: TrustMetric[]
  entryCards: EntryCard[]
  featuredRoutes: string[]
  cultureHighlights: CultureHighlight[]
  testimonials: Testimonial[]
}

export type HomeConfigBlock = 'heroStats' | 'trustMetrics' | 'entryCards' | 'featuredRoutes' | 'cultureHighlights' | 'testimonials'

export const HomeConfigBlockLabels: Record<HomeConfigBlock, string> = {
  heroStats: 'Hero 统计卡片',
  trustMetrics: '信任指标',
  entryCards: '入口卡片',
  featuredRoutes: '精选路线',
  cultureHighlights: '文化亮点',
  testimonials: '评价展示',
}
