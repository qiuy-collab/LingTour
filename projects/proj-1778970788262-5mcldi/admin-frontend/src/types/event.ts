// ============================================
// 活动/节庆管理 TypeScript 类型定义
// ============================================

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'draft'

export interface Event {
  id: string
  title: string
  titleEn: string
  date: string           // YYYY-MM-DD
  endDate?: string        // YYYY-MM-DD
  city: string
  citySlug: string
  adcode: number
  tags: string[]
  summary: string
  summaryEn: string
  description: string
  descriptionEn: string
  relatedRouteSlugs: string[]
  image: string
  status: EventStatus
}

export interface EventFormData {
  title: string
  titleEn: string
  date: string
  endDate?: string
  city: string
  citySlug: string
  adcode: number
  tags: string[]
  summary: string
  summaryEn: string
  description: string
  descriptionEn: string
  relatedRouteSlugs: string[]
  image: string
  status: EventStatus
}

// ─── 状态显示映射 ──────────────────────────────
export const EventStatusMap: Record<EventStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  past: '已结束',
  draft: '草稿',
}

export const EventStatusColorMap: Record<EventStatus, string> = {
  upcoming: '',
  ongoing: 'success',
  past: 'info',
  draft: 'warning',
}
