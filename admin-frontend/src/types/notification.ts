export interface Notification {
  id: string
  type: 'order' | 'booking' | 'review' | 'system' | 'audit'
  title: string
  body: string
  read: boolean
  resourceType?: string
  resourceId?: string
  link?: string
  createdAt: string
}

export interface NotificationFilter {
  page?: number
  pageSize?: number
  type?: string
  read?: boolean
}

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  order: '订单',
  booking: '预约',
  review: '审核',
  system: '系统',
  audit: '操作',
}

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  order: '#409eff',
  booking: '#67c23a',
  review: '#e6a23c',
  system: '#909399',
  audit: '#f56c6c',
}
