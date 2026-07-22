export type StaffRole = 'admin' | 'editor'
export type StaffStatus = 'active' | 'banned'

export interface StaffAccount {
  id: string
  email: string
  name: string
  role: StaffRole
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
}
