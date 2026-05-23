import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const instance = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'zh',
  },
})

instance.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    const url = response.config.url || ''
    if (url.includes('/auth/')) return response

    const body = response.data as unknown
    if (isPlainObject(body) && 'code' in body) {
      return response
    }

    if (Array.isArray(body)) {
      response.data = {
        code: 200,
        data: { items: body, total: body.length, page: 1, pageSize: body.length },
        message: 'success',
      }
      return response
    }

    if (isPlainObject(body)) {
      const items = body.items
      const data = body.data

      if (Array.isArray(items)) {
        response.data = {
          code: 200,
          data: {
            items,
            total: readNumber(body.total, items.length),
            page: readNumber(body.page, 1),
            pageSize: readNumber(body.pageSize ?? body.size ?? body.limit, items.length),
          },
          message: 'success',
        }
      } else if (Array.isArray(data)) {
        response.data = {
          code: 200,
          data: {
            items: data,
            total: readNumber(body.total, data.length),
            page: readNumber(body.page, 1),
            pageSize: readNumber(body.pageSize ?? body.size ?? body.limit, data.length),
          },
          message: 'success',
        }
      } else {
        response.data = { code: 200, data: body, message: 'success' }
      }
    } else {
      response.data = { code: 200, data: body, message: 'success' }
    }

    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      ElMessage.warning('登录已过期，请重新登录')
    }
    return Promise.reject(error)
  },
)

export default instance
