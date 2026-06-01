/**
 * 通用格式化工具
 * - formatDate: 兼容字符串/Date/null/空对象({})，避免列表显示 [object Object]
 * - formatDateTime: 含时分
 * - formatMoney: 价格 + 币种
 */

export function formatDate(val: unknown, withTime = false): string {
  if (!val) return '-'
  // 后端 GIN 索引下偶发返回 {} 空对象
  if (typeof val === 'object' && !(val instanceof Date)) {
    const obj = val as Record<string, unknown>
    if (Object.keys(obj).length === 0) return '-'
    // ISO 字符串可能被包装在 { value: '...' } 之类
    if (typeof obj.value === 'string') return formatDate(obj.value, withTime)
    return '-'
  }
  const d = val instanceof Date ? val : new Date(val as string)
  if (isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (!withTime) return `${y}-${m}-${day}`
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export function formatDateTime(val: unknown): string {
  return formatDate(val, true)
}

export function formatMoney(amount: unknown, currency = 'CNY'): string {
  if (amount === null || amount === undefined || amount === '') return '-'
  const n = Number(amount)
  if (isNaN(n)) return '-'
  const symbols: Record<string, string> = { CNY: '¥', USD: '$', SGD: 'S$', EUR: '€', JPY: '¥', HKD: 'HK$' }
  const sym = symbols[currency] ?? ''
  return `${sym}${n.toFixed(2)}`
}

/** 截断长文本，用于列表展示 */
export function truncate(text: unknown, max = 60): string {
  if (!text) return ''
  const s = String(text)
  return s.length > max ? s.slice(0, max) + '…' : s
}
