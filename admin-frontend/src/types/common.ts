// 通用 API 响应类型

/** 分页响应（统一格式：data + total + page + pageSize） */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/** 通用 API 响应 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/** 分页查询参数 */
export interface PageParams {
  page: number
  pageSize: number
  keyword?: string
}

/** 多语言对象结构 (匹配后端 I18nObject) */
export interface I18nObject {
  zh: string
  en: string
}

/** 将后端返回的纯字符串或 I18nObject 统一转换为 I18nObject */
export function toI18n(val: unknown): I18nObject {
  if (!val) return { zh: '', en: '' }
  if (typeof val === 'string') return { zh: val, en: '' }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>
    return { zh: String(obj.zh ?? ''), en: String(obj.en ?? '') }
  }
  return { zh: '', en: '' }
}

export function pickI18n(val: unknown, locale: keyof I18nObject = 'en'): string {
  if (!val) return ''
  if (typeof val === 'string') {
    // Handle JSON-stringified I18nObject (e.g. '{"en":"...","zh":"..."}')
    if (val.startsWith('{') && val.includes('"')) {
      try {
        const parsed = JSON.parse(val)
        if (typeof parsed === 'object' && parsed !== null) {
          return String(parsed[locale] ?? parsed.zh ?? parsed.en ?? val)
        }
      } catch { /* not JSON, return as-is */ }
    }
    return val
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    return String(obj[locale] ?? obj.zh ?? obj.en ?? '')
  }
  return String(val)
}

export function toI18nArray(val: unknown): I18nObject[] {
  if (!Array.isArray(val)) return []
  return val.map((item) => toI18n(item))
}
