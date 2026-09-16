import type { ContentText } from './common'

export interface ServiceMode {
  id: string
  sortOrder: number
  title: any
  titleEn?: string
  price: any
  bestFor: any
  bestForEn?: string
  body: any
  bodyEn?: string
  includes: any[]
  accent: 'light' | 'dark'
  featured: boolean
}

export interface ServiceModeFormData {
  sortOrder: number
  title: ContentText
  price: ContentText
  bestFor: ContentText
  body: ContentText
  includes: ContentText[]
  accent: 'light' | 'dark'
  featured: boolean
}

export type InterpreterStatus = 'active' | 'inactive' | 'pending_review'

export interface Interpreter {
  id: string
  sortOrder: number
  name: any
  language: any
  focus: any
  focusEn?: string
  helps: any[]
  avatar: string
  bio: any
  bioEn?: string
  status: InterpreterStatus
  city: any
}

export interface InterpreterFormData {
  sortOrder: number
  name: ContentText
  language: ContentText
  focus: ContentText
  helps: ContentText[]
  avatar: string
  bio: ContentText
  status: InterpreterStatus
  city: string
}

export type BookingStatus =
  | 'new'
  | 'read'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'deposit_pending'
  | 'deposit_paid'

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

export type FAQCategory = 'interpreting' | 'general' | 'routes'

export interface FAQ {
  id: string
  sortOrder: number
  question: any
  questionEn?: string
  answer: any
  answerEn?: string
  category: FAQCategory
}

export interface FAQFormData {
  sortOrder: number
  question: ContentText
  answer: ContentText
  category: FAQCategory
}

export const InterpreterStatusMap: Record<InterpreterStatus, string> = {
  active: '已激活',
  inactive: '已停用',
  pending_review: '待审核',
}

export const InterpreterStatusColorMap: Record<InterpreterStatus, string> = {
  active: 'success',
  inactive: 'info',
  pending_review: 'warning',
}

export const BookingStatusMap: Record<BookingStatus, string> = {
  new: '新预约',
  read: '已读',
  contacted: '已联系',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
  deposit_pending: '待付定金',
  deposit_paid: '定金已付',
}

export const BookingStatusColorMap: Record<BookingStatus, string> = {
  new: 'danger',
  read: 'warning',
  contacted: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'info',
  deposit_pending: 'warning',
  deposit_paid: 'success',
}

export const FAQCategoryMap: Record<FAQCategory, string> = {
  interpreting: '口译服务',
  general: '通用问题',
  routes: '路线相关',
}
