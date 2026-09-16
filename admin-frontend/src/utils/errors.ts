/** Shared API error message helpers. */
export function extractErrorMessage(error: any, fallback = '操作失败'): string {
  return error?.response?.data?.message || error?.message || fallback
}

export function extractErrorOrFallback(error: any, fallback = '保存失败'): string {
  return error?.response?.data?.message || error?.message || fallback
}

export function optionalContent(value: unknown): string | undefined {
  const content = typeof value === 'string' ? value.trim() : ''
  return content || undefined
}
