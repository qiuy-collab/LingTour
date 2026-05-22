export type UserStatus = 'active' | 'banned'
export type ProfileVisibility = 'public' | 'community' | 'private'

export interface ManagedUser {
  id: string
  name: string
  email: string
  avatar: string
  locale: 'en' | 'zh'
  createdAt: string
  status: UserStatus
  bookingsCount: number
  ordersCount: number
  favorites: string[]
  role?: 'admin' | 'editor'
  provider?: string
  country?: string
  homeBase?: string
  travelStyle?: string
  memberSince?: string
  bio?: string
  profileVisibility?: ProfileVisibility
  dispatchCount?: number
  photoDispatchCount?: number
  latestDispatchAt?: string | null
  latestDispatchTitle?: string | null
}

export interface UpdateUserProfilePayload {
  name?: string
  avatarUrl?: string
  country?: string
  homeBase?: string
  travelStyle?: string
  bio?: string
  profileVisibility?: ProfileVisibility
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

export const VisibilityMap: Record<ProfileVisibility, string> = {
  public: '公开',
  community: '社区可见',
  private: '仅自己',
}
