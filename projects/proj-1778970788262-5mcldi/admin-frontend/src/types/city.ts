import type { I18nObject } from './common'

export interface CitySection {
  id?: string
  title: any
  body: any
  image: string
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
  heroNarrative: any
  heroNarrativeEn?: string
  tags?: any[]
  editorIntro: any
  editorIntroEn?: string
  galleryImages?: string[]
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
  heroNarrative: I18nObject
  tags: I18nObject[]
  editorIntro: I18nObject
  galleryImages: string[]
  foodTitle: I18nObject
  foodDescription: I18nObject
  foodImages: string[]
  sections: CitySection[]
  published?: boolean
  status?: 'draft' | 'published'
  routeSlugs?: string[]
  relatedCitySlugs?: string[]
}
