// ============================================
// 首页内容管理 API
// ============================================
import api from './index'
import type { ApiResponse } from '@/types/common'
import type { HomeConfig } from '@/types/home'

export const homeApi = {
  getHomeConfig() {
    return api.get<ApiResponse<HomeConfig>>('/home')
  },

  updateHomeConfig(data: HomeConfig) {
    return api.put<ApiResponse<HomeConfig>>('/home', data)
  },
}
