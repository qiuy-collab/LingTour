import type { ContentText } from './common'
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
  name: ContentText
  collectionId?: string
  collectionName?: string
  price: number
  currency: string
  tag: ContentText
  image: string
  primaryMedia?: MediaAsset | null
  story: ContentText
  material?: ContentText
  dimensions?: ContentText
  origin?: ContentText
  care?: ContentText
  gallery: string[]
  galleryMedia?: MediaAsset[]
  stock: number
  published: boolean
  originTrace?: OriginTrace
}
