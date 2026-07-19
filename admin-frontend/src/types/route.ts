import type { I18nObject } from './common'
import type { MediaAsset } from './media'

export type CultureTag =
  | 'Bay Area'
  | 'Chaoshan'
  | 'Hakka'
  | 'Coastal'
  | 'Mountain'
  | 'Guangfu'
  | 'BayArea'

export interface RouteStop {
  id?: string
  sortOrder: number
  time: string
  stopName: any
  story: any
  culturalStory: any
  details?: any[]
  image: string
  primaryMedia?: MediaAsset | null
  images?: string[]
  media?: MediaAsset[]
  lat?: number
  lng?: number
  meal?: any
  hotel?: any
  transit?: any
}

export interface Route {
  id: string
  slug: string
  title: any
  titleEn?: string
  cultureTag: string
  cityName: any
  cityNameEn?: string
  duration: any
  durationEn?: string
  audience: any
  audienceEn?: string
  summary: any
  summaryEn?: string
  story: any
  storyEn?: string
  coverImage: string
  routeRegionKey?: string | null
  stops?: RouteStop[]
  stopCount?: number
  published: boolean
  citySlugs?: string[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface RouteFormData {
  id?: string
  slug: string
  title: I18nObject
  cultureTag: string
  cityName: I18nObject
  duration: I18nObject
  audience: I18nObject
  summary: I18nObject
  story: I18nObject
  coverImage: string
  routeRegionKey?: string
  stops: RouteStop[]
  published?: boolean
  citySlugs?: string[]
}
