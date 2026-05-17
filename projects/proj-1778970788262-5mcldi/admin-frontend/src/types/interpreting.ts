// ============================================
// 口译服务相关 TypeScript 类型定义
// 覆盖: 服务模式 / 口译员 / 预约 / FAQ
// ============================================

// ─── 服务模式 (Service Modes) ──────────────────────
export interface ServiceMode {
  id: string
  sortOrder: number
  title: string
  titleEn: string
  price: string
  bestFor: string
  bestForEn: string
  body: string
  bodyEn: string
  includes: string[]
  includesEn: string[]
  accent: 'light' | 'dark'
  featured: boolean
}

export interface ServiceModeFormData {
  sortOrder: number
  title: string
  titleEn: string
  price: string
  bestFor: string
  bestForEn: string
  body: string
  bodyEn: string
  includes: string[]
  includesEn: string[]
  accent: 'light' | 'dark'
  featured: boolean
}

// ─── 口译员 (Interpreters) ──────────────────────
export type InterpreterStatus = 'active' | 'inactive' | 'pending_review'

export interface Interpreter {
  id: string
  sortOrder: number
  name: string
  language: string
  focus: string
  focusEn: string
  helps: string[]
  helpsEn: string[]
  avatar: string
  bio: string
  bioEn: string
  status: InterpreterStatus
  city: string
}

export interface InterpreterFormData {
  sortOrder: number
  name: string
  language: string
  focus: string
  focusEn: string
  helps: string[]
  helpsEn: string[]
  avatar: string
  bio: string
  bioEn: string
  status: InterpreterStatus
  city: string
}

// ─── 口译预约 (Bookings) ──────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  name: string
  contact: string
  city: string
  date: string
  mode: string
  groupSize: string
  needs: string
  fastTrack: boolean
  status: BookingStatus
  assignedInterpreterId: string | null
  assignedInterpreterName: string | null
  createdAt: string
}

// ─── 常见问题 (FAQs) ──────────────────────
export type FAQCategory = 'interpreting' | 'general' | 'routes'

export interface FAQ {
  id: string
  sortOrder: number
  question: string
  questionEn: string
  answer: string
  answerEn: string
  category: FAQCategory
}

export interface FAQFormData {
  sortOrder: number
  question: string
  questionEn: string
  answer: string
  answerEn: string
  category: FAQCategory
}

// ─── 状态显示映射 ──────────────────────────────
export const InterpreterStatusMap: Record<InterpreterStatus, string> = {
  active: '已激活',
  inactive: '已禁用',
  pending_review: '待审核',
}

export const InterpreterStatusColorMap: Record<InterpreterStatus, string> = {
  active: 'success',
  inactive: 'info',
  pending_review: 'warning',
}

export const BookingStatusMap: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
}

export const BookingStatusColorMap: Record<BookingStatus, string> = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'info',
}

export const FAQCategoryMap: Record<FAQCategory, string> = {
  interpreting: '口译服务',
  general: '通用问题',
  routes: '路线相关',
}
