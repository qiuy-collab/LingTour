// 系统设置 API
import api from './index'
import type { AppSettings } from '@/types/settings'

/** 获取系统设置 */
export function getSettings(): Promise<{ data: { code: number; data: AppSettings; message: string } }> {
  return api.get('/settings')
}

/** 更新系统设置 */
export function updateSettings(data: Partial<AppSettings>): Promise<{ data: { code: number; data: AppSettings; message: string } }> {
  return api.put('/settings', data)
}
