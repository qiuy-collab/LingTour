export type StaffRole = 'admin' | 'editor'
export type StaffStatus = 'active' | 'banned'

export interface StaffAccount {
  id: string
  email: string
  name: string
  role: StaffRole
  /** 完整角色集合；同时拥有旅行者身份时为 ['admin' | 'editor', 'traveler'] */
  roles?: string[]
  /** 该后台账号是否同时保留旅行者身份 */
  alsoTraveler?: boolean
  status: StaffStatus
  createdAt: string
  updatedAt: string
}

export interface StaffAccountPayload {
  email: string
  name: string
  role: StaffRole
  status: StaffStatus
  password?: string
  /** 同时保留旅行者身份，使同一邮箱既是管理员也是旅行者 */
  alsoTraveler?: boolean
}
