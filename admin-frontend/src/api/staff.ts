import api from './index'
import type { PaginatedResponse } from '@/types/common'
import type {
  StaffAccount,
  StaffAccountPayload,
  StaffRole,
  StaffStatus,
} from '@/types/staff'

export function getStaffAccounts(params: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: StaffRole | ''
  status?: StaffStatus | ''
}): Promise<{
  data: {
    code: number
    data: PaginatedResponse<StaffAccount>
    message: string
  }
}> {
  return api.get('/users/staff', { params })
}

export function createStaffAccount(payload: StaffAccountPayload) {
  return api.post('/users/staff', payload)
}

export function updateStaffAccount(
  id: string,
  payload: Partial<StaffAccountPayload>,
) {
  return api.patch(`/users/staff/${id}`, payload)
}

export function deleteStaffAccount(id: string) {
  return api.delete(`/users/staff/${id}`)
}
