// ============================================
// FAQ 管理 API
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { FAQ, FAQFormData } from '@/types/interpreting'

export const faqsApi = {
  getFAQs(params: PageParams & { category?: string }) {
    return api.get<ApiResponse<PaginatedResponse<FAQ>>>('/interpreting/faqs', { params })
  },

  getFAQ(id: string) {
    return api.get<ApiResponse<FAQ>>(`/interpreting/faqs/${id}`, { params: { rawI18n: true } })
  },

  createFAQ(data: FAQFormData) {
    return api.post<ApiResponse<FAQ>>('/interpreting/faqs', data)
  },

  updateFAQ(id: string, data: Partial<FAQFormData>) {
    return api.put<ApiResponse<FAQ>>(`/interpreting/faqs/${id}`, data)
  },

  deleteFAQ(id: string) {
    return api.delete<ApiResponse<null>>(`/interpreting/faqs/${id}`)
  },

  /** 更新排序 — 后端 /sort 端点不可用，通过 PUT 更新 sortOrder */
  updateSort(id: string, sortOrder: number) {
    return api.put<ApiResponse<FAQ>>(`/interpreting/faqs/${id}`, { sortOrder })
  },
}
