import type { ContentText } from './common'

export interface HeroStat {
  title: ContentText
  description: ContentText
}

export interface HomeHeroConfig {
  image: string
  caption: ContentText
  ctaImage: string
  interpretingImage: string
  interpretingLabel: ContentText
  badgeValue: string
  badgeLabel: ContentText
  video: {
    url: string
    poster: string
    title: ContentText
    description: ContentText
    duration: string
    resolution: string
  }
}

export interface TrustMetric {
  value: string
  label: ContentText
}

export interface EntryCard {
  title: ContentText
  description: ContentText
  image: string
  link: string
}

export interface CultureHighlight {
  title: ContentText
  description: ContentText
  image: string
  citySlug: string
}

export interface Testimonial {
  quote: ContentText
  author: ContentText
  avatar: string
}

export interface RouteRegionConfig {
  key: string
  title: ContentText
  note: ContentText
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
  heroStats: '首屏统计卡片',
  trustMetrics: '信任指标',
  entryCards: '入口卡片',
  featuredRoutes: '精选路线',
  cultureHighlights: '文化亮点',
  routeRegions: '路线地区分组',
  testimonials: '评价展示',
}
