// ============================================
// 口译服务模式 API
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { ServiceMode, ServiceModeFormData } from '@/types/interpreting'

export const modesApi = {
  getModes(params: PageParams) {
    return api.get<ApiResponse<PaginatedResponse<ServiceMode>>>('/interpreting/modes', { params })
  },

  getMode(id: string) {
    return api.get<ApiResponse<ServiceMode>>(`/interpreting/modes/${id}`, { params: { rawI18n: true } })
  },

  createMode(data: ServiceModeFormData) {
    return api.post<ApiResponse<ServiceMode>>('/interpreting/modes', data)
  },

  updateMode(id: string, data: Partial<ServiceModeFormData>) {
    return api.put<ApiResponse<ServiceMode>>(`/interpreting/modes/${id}`, data)
  },

  deleteMode(id: string) {
    return api.delete<ApiResponse<null>>(`/interpreting/modes/${id}`)
  },

  /** 更新排序 — 后端 /sort 端点不可用，通过 PUT 更新 sortOrder */
  updateSort(id: string, sortOrder: number) {
    return api.patch<ApiResponse<ServiceMode>>(`/interpreting/modes/${id}/sort`, { sortOrder })
  },
}
