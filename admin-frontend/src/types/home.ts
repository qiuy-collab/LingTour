import type { I18nObject } from './common'

export interface HeroStat {
  title: I18nObject
  description: I18nObject
}

export interface TrustMetric {
  value: string
  label: I18nObject
}

export interface EntryCard {
  title: I18nObject
  description: I18nObject
  image: string
  link: string
}

export interface CultureHighlight {
  title: I18nObject
  description: I18nObject
  image: string
  citySlug: string
}

export interface Testimonial {
  quote: I18nObject
  author: I18nObject
  avatar: string
}

export interface RouteRegionConfig {
  key: string
  title: I18nObject
  note: I18nObject
  adcodes: number[]
}

export interface HomeConfig {
  heroStats: HeroStat[]
  trustMetrics: TrustMetric[]
  entryCards: EntryCard[]
  featuredRoutes: string[]
  cultureHighlights: CultureHighlight[]
  testimonials: Testimonial[]
  routeRegions: RouteRegionConfig[]
}

export type HomeConfigBlock =
  | 'heroStats'
  | 'trustMetrics'
  | 'entryCards'
  | 'featuredRoutes'
  | 'cultureHighlights'
  | 'routeRegions'
  | 'testimonials'

export const HomeConfigBlockLabels: Record<HomeConfigBlock, string> = {
  heroStats: 'Hero 统计卡片',
  trustMetrics: '信任指标',
  entryCards: '入口卡片',
  featuredRoutes: '精选路线',
  cultureHighlights: '文化亮点',
  routeRegions: '路线地区分组',
  testimonials: '评价展示',
}
