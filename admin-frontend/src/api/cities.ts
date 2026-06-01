import request from './index'
import type { ApiResponse, PageParams } from '@/types/common'
import type { City, CityFormData } from '@/types/city'

export const citiesApi = {
  /** 获取城市列表（分页） */
  async getCities(params: PageParams & { keyword?: string; status?: string }) {
    const res = await request.get<ApiResponse<any>>('/cities', {
      params: {
        page: params.page,
        limit: params.pageSize,
        q: params.keyword || undefined,
        published:
          params.status === 'published'
            ? true
            : params.status === 'draft'
              ? false
              : undefined,
      },
    })

    const payload = res.data.data || {}
    ;(res as any).data.data = {
      data: payload.data || [],
      total: payload.total || 0,
      page: payload.page || params.page || 1,
      pageSize: payload.pageSize || params.pageSize || 10,
    }

    return res as any
  },

  /** 获取单个城市 */
  getCity(id: string) {
    return request.get<ApiResponse<City>>(`/cities/${id}`, { params: { rawI18n: true } })
  },

  /** 新增城市 */
  createCity(data: CityFormData) {
    return request.post<ApiResponse<City>>('/cities', data)
  },

  /** 更新城市 */
  updateCity(id: string, data: Partial<CityFormData>) {
    return request.put<ApiResponse<City>>(`/cities/${id}`, data)
  },

  /** 发布城市 */
  publishCity(id: string) {
    return request.patch<ApiResponse<City>>(`/cities/${id}/publish`)
  },

  /** 下架城市 */
  unpublishCity(id: string) {
    return request.patch<ApiResponse<City>>(`/cities/${id}/unpublish`)
  },

  /** 删除城市 */
  deleteCity(id: string) {
    return request.delete<ApiResponse<null>>(`/cities/${id}`)
  },
}
