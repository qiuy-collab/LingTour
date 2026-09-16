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

/** Business content is authored once and stored as English text. */
export type ContentText = string

export function readContentValue(val: unknown): string {
  return typeof val === 'string' ? val : ''
}
