// 系统设置 API
import api from './index'
import type { AppSettings } from '@/types/settings'

/** 获取系统设置 — 后端返回 { id, scope, payload: {...} } */
export async function getSettings(): Promise<{ data: { code: number; data: AppSettings; message: string } }> {
  const res = await api.get('/settings')
  // 后端返回 { id, scope, payload: { seoTitle, ... } }，前端需要 payload 内容
  const raw = res.data?.data || res.data
  if (raw && raw.payload && typeof raw.payload === 'object') {
    res.data = { code: 200, data: raw.payload as AppSettings, message: 'success' }
  }
  return res as any
}

/** 更新系统设置 — 后端期望 { payload: {...} } */
export function updateSettings(data: Partial<AppSettings>): Promise<{ data: { code: number; data: AppSettings; message: string } }> {
  return api.put('/settings', { payload: data })
}
