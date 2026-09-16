import type { ContentText } from '@/types/common'

export interface CommunityBrief {
  id: string
  slug: string
  title: ContentText
  prompt: ContentText
  channel: string
  location: string
  route: string
  mood: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CommunityBriefPayload = Omit<CommunityBrief, 'id' | 'createdAt' | 'updatedAt'>
