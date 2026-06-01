import request from './index'
import type { ApiResponse, PageParams, PaginatedResponse } from '@/types/common'
import type { Route, RouteFormData } from '@/types/route'

export const routesApi = {
  /** 获取路线列表（分页，支持状态筛选） */
  getRoutes(params: PageParams & { status?: string; cityName?: string }) {
    return request.get<ApiResponse<PaginatedResponse<Route>>>('/routes', {
      params: { ...params, limit: params.pageSize },
    })
  },

  /** 获取单个路线 */
  getRoute(id: string) {
    return request.get<ApiResponse<Route>>(`/routes/${id}`, { params: { rawI18n: true } })
  },

  /** 新增路线 */
  createRoute(data: RouteFormData) {
    return request.post<ApiResponse<Route>>('/routes', data)
  },

  /** 更新路线 */
  updateRoute(id: string, data: Partial<RouteFormData>) {
    return request.put<ApiResponse<Route>>(`/routes/${id}`, data)
  },

  /** 发布路线 */
  publishRoute(id: string) {
    return request.patch<ApiResponse<Route>>(`/routes/${id}/publish`)
  },

  /** 下架路线 */
  unpublishRoute(id: string) {
    return request.patch<ApiResponse<Route>>(`/routes/${id}/unpublish`)
  },

  /** 删除路线 */
  deleteRoute(id: string) {
    return request.delete<ApiResponse<null>>(`/routes/${id}`)
  },
}
