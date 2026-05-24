export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'logout' | 'export' | 'batch_delete' | 'status_change'
  resource: string
  resourceId?: string
  resourceName?: string
  details?: Record<string, any>
  ip?: string
  userAgent?: string
  createdAt: string
}

export interface AuditLogFilter {
  page?: number
  pageSize?: number
  action?: string
  resource?: string
  userId?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: '创建',
  update: '更新',
  delete: '删除',
  publish: '发布',
  unpublish: '下架',
  login: '登录',
  logout: '登出',
  export: '导出',
  batch_delete: '批量删除',
  status_change: '状态变更',
}

export const AUDIT_RESOURCE_LABELS: Record<string, string> = {
  city: '城市',
  route: '路线',
  collection: '系列',
  product: '商品',
  order: '订单',
  service_mode: '服务模式',
  interpreter: '口译员',
  booking: '预约',
  faq: 'FAQ',
  event: '活动',
  community_post: '社区帖子',
  home_config: '首页配置',
  user: '用户',
  settings: '系统设置',
}
