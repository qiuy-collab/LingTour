import type { I18nObject } from './common'

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'draft'

export interface Event {
  id: string
  title: any
  titleEn?: string
  date: string
  endDate?: string
  city: string
  citySlug: string
  adcode: number
  tags: string[]
  summary: any
  summaryEn?: string
  description: any
  descriptionEn?: string
  relatedRouteSlugs: string[]
  image: string
  status: EventStatus
}

export interface EventFormData {
  slug?: string
  title: I18nObject
  date: string
  endDate?: string
  city: string
  citySlug: string
  adcode: number
  tags: string[]
  summary: I18nObject
  description: I18nObject
  relatedRouteSlugs: string[]
  image: string
  status: EventStatus
}

export const EventStatusMap: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  past: 'Ended',
  draft: 'Draft',
}

export const EventStatusColorMap: Record<EventStatus, string> = {
  upcoming: '',
  ongoing: 'success',
  past: 'info',
  draft: 'warning',
}
