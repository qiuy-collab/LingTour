import type { I18nObject } from './common'

export interface HeroStat {
  title: I18nObject
  description: I18nObject
}

export interface HomeHeroConfig {
  image: string
  caption: I18nObject
  ctaImage: string
  interpretingImage: string
  interpretingLabel: I18nObject
  badgeValue: string
  badgeLabel: I18nObject
  video: {
    url: string
    poster: string
    title: I18nObject
    description: I18nObject
    duration: string
    resolution: string
  }
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
  hero: HomeHeroConfig
  heroStats: HeroStat[]
  trustMetrics: TrustMetric[]
  entryCards: EntryCard[]
  featuredRoutes: string[]
  cultureHighlights: CultureHighlight[]
  testimonials: Testimonial[]
  routeRegions: RouteRegionConfig[]
}

export type HomeConfigBlock =
  | 'hero'
  | 'heroStats'
  | 'trustMetrics'
  | 'entryCards'
  | 'featuredRoutes'
  | 'cultureHighlights'
  | 'routeRegions'
  | 'testimonials'

export const HomeConfigBlockLabels: Record<HomeConfigBlock, string> = {
  hero: '首屏与影片',
  heroStats: 'Hero 统计卡片',
  trustMetrics: '信任指标',
  entryCards: '入口卡片',
  featuredRoutes: '精选路线',
  cultureHighlights: '文化亮点',
  routeRegions: '路线地区分组',
  testimonials: '评价展示',
}
