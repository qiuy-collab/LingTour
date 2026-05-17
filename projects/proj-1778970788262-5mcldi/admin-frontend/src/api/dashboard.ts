// 仪表盘 API
import api from './index'
import type { DashboardData } from '@/types/dashboard'

/** 获取仪表盘统计数据 */
export function getDashboardStats(): Promise<{ data: { code: number; data: DashboardData; message: string } }> {
  return api.get('/dashboard')
}
