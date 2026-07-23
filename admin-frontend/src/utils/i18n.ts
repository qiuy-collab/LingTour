/**
 * I18n 共享工具
 * - optionalI18n: 如果 zh/en 都为空则返回 undefined（避免发送空 I18nObject）
 * - extractErrorMessage: 从 axios error 提取后端错误消息
 */

import { readContentValue, type I18nObject } from '@/types/common'

export function optionalI18n(value: any): I18nObject | undefined {
  const content = readContentValue(value).trim()
  return content ? { zh: '', en: content } : undefined
}

export function extractErrorMessage(error: any, fallback = '操作失败'): string {
  return error?.response?.data?.message || error?.message || fallback
}

export function extractErrorOrFallback(error: any, fallback = '保存失败'): string {
  return error?.response?.data?.message || error?.message || fallback
}
