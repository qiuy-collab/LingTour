import type { ContentText } from './common'

export interface StoreCollection {
  id: string
  slug: string
  title: any
  titleEn?: string
  routeName: any
  routeSlug: string
  image: string
  body: any
  bodyEn?: string
  sortOrder: number
  published: boolean
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CollectionFormData {
  id?: string
  slug: string
  title: ContentText
  routeName: string
  routeSlug: string
  image: string
  body: ContentText
  sortOrder: number
  published: boolean
}
