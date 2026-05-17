import request from './index'
import type { ApiResponse, PageParams, PaginatedResponse } from '@/types/common'
import type { City, CityFormData } from '@/types/city'

export const citiesApi = {
  /** 获取城市列表（分页） */
  getCities(params: PageParams) {
    return request.get<ApiResponse<PaginatedResponse<City>>>('/cities', { params })
  },

  /** 获取单个城市 */
  getCity(id: string) {
    return request.get<ApiResponse<City>>(`/cities/${id}`)
  },

  /** 新增城市 */
  createCity(data: CityFormData) {
    return request.post<ApiResponse<City>>('/cities', data)
  },

  /** 更新城市 */
  updateCity(id: string, data: Partial<CityFormData>) {
    return request.put<ApiResponse<City>>(`/cities/${id}`, data)
  },

  /** 删除城市 */
  deleteCity(id: string) {
    return request.delete<ApiResponse<null>>(`/cities/${id}`)
  },
}
