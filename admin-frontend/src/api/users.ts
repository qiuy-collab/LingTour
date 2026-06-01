// 用户管理 API
import api from './index'
import type { ManagedUser, UpdateUserProfilePayload, UserStatus } from '@/types/user'
import type { PaginatedResponse } from '@/types/common'

interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: UserStatus | ''
}

/** 获取用户列表 */
export function getUsers(params: UserListParams): Promise<{ data: { code: number; data: PaginatedResponse<ManagedUser>; message: string } }> {
  return api.get('/users', { params })
}

/** 获取单个用户 */
export function getUser(id: string): Promise<{ data: { code: number; data: ManagedUser; message: string } }> {
  return api.get(`/users/${id}`)
}

/** 封禁用户 */
export function banUser(id: string): Promise<{ data: { code: number; data: ManagedUser; message: string } }> {
  return api.patch(`/users/${id}/status`, { status: 'banned' as UserStatus })
}

/** 解封用户 */
export function unbanUser(id: string): Promise<{ data: { code: number; data: ManagedUser; message: string } }> {
  return api.patch(`/users/${id}/status`, { status: 'active' as UserStatus })
}

/** 更新用户档案 */
export function updateUserProfile(
  id: string,
  payload: UpdateUserProfilePayload,
): Promise<{ data: { code: number; data: ManagedUser; message: string } }> {
  return api.patch(`/users/${id}/profile`, payload)
}
