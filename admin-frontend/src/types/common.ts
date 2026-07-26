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

export function readContentValue(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') {
    if (val.startsWith('{') && val.includes('"')) {
      try {
        return readContentValue(JSON.parse(val))
      } catch {
        return val
      }
    }
    return val
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>
    return String(obj.en || obj.zh || '')
  }
  return String(val)
}

/**
 * 将后端返回的纯字符串或 I18nObject 统一转换为 I18nObject。
 *
 * 正文只维护一份英文，编辑器也只编辑 en。但后端保存 jsonb 字段时用的是
 * Object.assign 整体替换，所以这里必须把记录里原有的 zh 原样带回来，
 * 否则每保存一次就会把线上遗留的中文内容抹掉。
 */
export function toI18n(val: unknown): I18nObject {
  const content = readContentValue(val)
  let legacyZh = ''

  if (typeof val === 'string' && val.startsWith('{') && val.includes('"')) {
    try {
      val = JSON.parse(val)
    } catch {
      // 不是 JSON，按纯字符串处理
    }
  }
  if (typeof val === 'object' && val !== null) {
    const raw = (val as Record<string, unknown>).zh
    if (typeof raw === 'string') legacyZh = raw
  }

  return { zh: legacyZh, en: content }
}

export function pickI18n(val: unknown, locale: keyof I18nObject = 'en'): string {
  if (!val) return ''
  if (typeof val === 'string') {
    // Handle JSON-stringified I18nObject (e.g. '{"en":"...","zh":"..."}')
    if (val.startsWith('{') && val.includes('"')) {
      try {
        const parsed = JSON.parse(val)
        if (typeof parsed === 'object' && parsed !== null) {
          return String(parsed[locale] || parsed.en || parsed.zh || val)
        }
      } catch { /* not JSON, return as-is */ }
    }
    return val
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    return String(obj[locale] || obj.en || obj.zh || '')
  }
  return String(val)
}

export function toI18nArray(val: unknown): I18nObject[] {
  if (!Array.isArray(val)) return []
  return val.map((item) => toI18n(item))
}
