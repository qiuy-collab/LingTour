import request from './index'
import type { ApiResponse } from '@/types/common'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export const authApi = {
  login(data: LoginRequest) {
    return request.post<ApiResponse<LoginResponse>>('/auth/login', data)
  },

  logout() {
    return request.post('/auth/logout')
  },
}
