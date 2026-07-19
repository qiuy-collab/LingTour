import type { I18nObject } from './common'
import type { MediaAsset } from './media'

export interface CitySection {
  id?: string
  title: any
  body: any
  image: string
  primaryMedia?: MediaAsset | null
  images?: string[]
  media?: MediaAsset[]
  statLabel?: any
  statValue?: any
  breathImage?: string
  breathQuote?: any
  sortOrder: number
}

export interface City {
  id: string
  slug: string
  name: any
  nameEn?: string
  regionLabel: any
  regionLabelEn?: string
  heroImage: string
  heroMedia?: MediaAsset | null
  heroNarrative: any
  heroNarrativeEn?: string
  tags?: any[]
  editorIntro: any
  editorIntroEn?: string
  galleryImages?: string[]
  galleryMedia?: MediaAsset[]
  foodTitle: any
  foodTitleEn?: string
  foodDescription: any
  foodDescriptionEn?: string
  foodImages?: string[]
  adcode?: number
  sections?: CitySection[]
  published?: boolean
  status?: 'draft' | 'published'
  routeSlugs?: string[]
  relatedCitySlugs?: string[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface CityFormData {
  id?: string
  slug: string
  name: I18nObject
  regionLabel: I18nObject
  adcode?: number
  heroImage: string
  heroMedia?: MediaAsset | null
  heroNarrative: I18nObject
  tags: I18nObject[]
  editorIntro: I18nObject
  galleryImages: string[]
  galleryMedia?: MediaAsset[]
  foodTitle: I18nObject
  foodDescription: I18nObject
  foodImages: string[]
  sections: CitySection[]
  published?: boolean
  status?: 'draft' | 'published'
  routeSlugs?: string[]
  relatedCitySlugs?: string[]
}
