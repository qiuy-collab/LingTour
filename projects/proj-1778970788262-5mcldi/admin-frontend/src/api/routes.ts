import request from './index'
import type { ApiResponse, PageParams, PaginatedResponse } from '@/types/common'
import type { Route, RouteFormData } from '@/types/route'

export const routesApi = {
  /** 获取路线列表（分页，支持状态筛选） */
  getRoutes(params: PageParams & { status?: string; cityName?: string }) {
    return request.get<ApiResponse<PaginatedResponse<Route>>>('/routes', { params })
  },

  /** 获取单个路线 */
  getRoute(id: string) {
    return request.get<ApiResponse<Route>>(`/routes/${id}`)
  },

  /** 新增路线 */
  createRoute(data: RouteFormData) {
    return request.post<ApiResponse<Route>>('/routes', data)
  },

  /** 更新路线 */
  updateRoute(id: string, data: Partial<RouteFormData>) {
    return request.put<ApiResponse<Route>>(`/routes/${id}`, data)
  },

  /** 更新路线状态（上下架） */
  updateRouteStatus(id: string, status: string) {
    return request.patch<ApiResponse<Route>>(`/routes/${id}/status`, { status })
  },

  /** 删除路线 */
  deleteRoute(id: string) {
    return request.delete<ApiResponse<null>>(`/routes/${id}`)
  },
}
