// 用户管理类型定义

export type UserStatus = 'active' | 'banned'

export interface ManagedUser {
  id: string
  name: string
  email: string
  avatar: string
  locale: 'en' | 'zh'
  createdAt: string        // ISO datetime
  status: UserStatus
  bookingsCount: number    // 口译预约次数
  ordersCount: number      // 商城订单次数
  favorites: string[]      // 收藏项 ID 列表
}

export const UserStatusMap: Record<UserStatus, string> = {
  active: '正常',
  banned: '已封禁',
}

export const UserStatusColorMap: Record<UserStatus, string> = {
  active: 'success',
  banned: 'danger',
}

export const LocaleMap: Record<string, string> = {
  en: 'English',
  zh: '中文',
}
