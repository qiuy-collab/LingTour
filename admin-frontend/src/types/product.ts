import type { I18nObject } from './common'
import type { MediaAsset } from './media'

export interface OriginTrace {
  location: string
  citySlug: string
  cityName: string
  materialSource: string
  craftTradition: string
  process: string
  mapAdcode: number
}

export interface Product {
  id: string
  slug: string
  name: any
  nameEn?: string
  collectionId?: string
  collectionName?: string
  collection?: any
  price: number
  currency: string
  tag: any
  tagEn?: string
  image: string
  primaryMedia?: MediaAsset | null
  story: any
  storyEn?: string
  material?: any
  materialEn?: string
  dimensions?: any
  dimensionsEn?: string
  origin?: any
  originEn?: string
  care?: any
  careEn?: string
  gallery: string[]
  galleryMedia?: MediaAsset[]
  stock: number
  published: boolean
  originTrace?: OriginTrace
  createdAt?: string
  updatedAt?: string
}

export interface ProductFormData {
  id?: string
  slug: string
  name: I18nObject
  collectionId?: string
  collectionName?: string
  price: number
  currency: string
  tag: I18nObject
  image: string
  primaryMedia?: MediaAsset | null
  story: I18nObject
  material?: I18nObject
  dimensions?: I18nObject
  origin?: I18nObject
  care?: I18nObject
  gallery: string[]
  galleryMedia?: MediaAsset[]
  stock: number
  published: boolean
  originTrace?: OriginTrace
}
