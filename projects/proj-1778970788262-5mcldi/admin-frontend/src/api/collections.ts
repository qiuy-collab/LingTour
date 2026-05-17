// ============================================
// 商城系列 API 服务
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { StoreCollection, CollectionFormData } from '@/types/collection'

export const collectionsApi = {
  getCollections(params: PageParams) {
    return api.get<ApiResponse<PaginatedResponse<StoreCollection>>>('/shop/collections', { params })
  },

  getCollection(id: string) {
    return api.get<ApiResponse<StoreCollection>>(`/shop/collections/${id}`)
  },

  createCollection(data: CollectionFormData) {
    return api.post<ApiResponse<StoreCollection>>('/shop/collections', data)
  },

  updateCollection(id: string, data: Partial<CollectionFormData>) {
    return api.put<ApiResponse<StoreCollection>>(`/shop/collections/${id}`, data)
  },

  deleteCollection(id: string) {
    return api.delete<ApiResponse<null>>(`/shop/collections/${id}`)
  },
}
