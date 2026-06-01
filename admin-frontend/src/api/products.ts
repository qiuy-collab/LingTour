// ============================================
// 商品 API 服务
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { Product, ProductFormData } from '@/types/product'

export const productsApi = {
  getProducts(params: PageParams & { collectionId?: string; status?: string }) {
    return api.get<ApiResponse<PaginatedResponse<Product>>>('/shop/products', {
      params: { ...params, limit: params.pageSize },
    })
  },

  getProduct(id: string) {
    return api.get<ApiResponse<Product>>(`/shop/products/${id}`, { params: { rawI18n: true } })
  },

  createProduct(data: ProductFormData) {
    return api.post<ApiResponse<Product>>('/shop/products', data)
  },

  updateProduct(id: string, data: Partial<ProductFormData>) {
    return api.put<ApiResponse<Product>>(`/shop/products/${id}`, data)
  },

  /** 上下架 — 后端无独立 /status 端点，通过 PUT 更新 published 字段 */
  updateProductStatus(id: string, published: boolean) {
    return api.put<ApiResponse<Product>>(`/shop/products/${id}`, { published })
  },

  /** 库存调整 — 后端无独立 /stock 端点，通过 PUT 更新 stock 字段 */
  updateStock(id: string, stock: number) {
    return api.put<ApiResponse<Product>>(`/shop/products/${id}`, { stock })
  },

  deleteProduct(id: string) {
    return api.delete<ApiResponse<null>>(`/shop/products/${id}`)
  },
}
