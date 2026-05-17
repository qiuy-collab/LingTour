// ============================================
// 口译员管理 API
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { Interpreter, InterpreterFormData, InterpreterStatus } from '@/types/interpreting'

export const interpretersApi = {
  getInterpreters(params: PageParams & { status?: string }) {
    return api.get<ApiResponse<PaginatedResponse<Interpreter>>>('/interpreting/profiles', { params })
  },

  getInterpreter(id: string) {
    return api.get<ApiResponse<Interpreter>>(`/interpreting/profiles/${id}`, { params: { rawI18n: true } })
  },

  createInterpreter(data: InterpreterFormData) {
    return api.post<ApiResponse<Interpreter>>('/interpreting/profiles', data)
  },

  updateInterpreter(id: string, data: Partial<InterpreterFormData>) {
    return api.put<ApiResponse<Interpreter>>(`/interpreting/profiles/${id}`, data)
  },

  deleteInterpreter(id: string) {
    return api.delete<ApiResponse<null>>(`/interpreting/profiles/${id}`)
  },

  updateStatus(id: string, status: InterpreterStatus) {
    return api.patch<ApiResponse<Interpreter>>(`/interpreting/profiles/${id}/status`, { status })
  },
}
