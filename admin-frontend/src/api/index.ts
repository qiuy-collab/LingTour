import axios, { type InternalAxiosRequestConfig } from 'axios'
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
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'zh',
  },
})

// --- Token Refresh Logic ---
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: any) => void
}> = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

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
        data: { data: body, total: body.length, page: 1, pageSize: body.length },
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
            data: items,
            total: readNumber(body.total, items.length),
            page: readNumber(body.page, 1),
            pageSize: readNumber(body.pageSize, items.length),
          },
          message: 'success',
        }
      } else if (Array.isArray(data)) {
        response.data = {
          code: 200,
          data: {
            data,
            total: readNumber(body.total, data.length),
            page: readNumber(body.page, 1),
            pageSize: readNumber(body.pageSize, data.length),
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
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Token expired — attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints themselves
      if (originalRequest.url?.includes('/auth/')) {
        const authStore = useAuthStore()
        authStore.logout()
        ElMessage.warning('登录已过期，请重新登录')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(instance(originalRequest))
            },
            reject: (err: any) => {
              reject(err)
            },
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const authStore = useAuthStore()
        const refreshRes = await instance.post('/auth/refresh', null, {
          timeout: 10000,
        })
        const newToken = refreshRes.data?.access_token || refreshRes.data?.data?.access_token
        if (newToken) {
          authStore.token = newToken
          localStorage.setItem('token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
          return instance(originalRequest)
        } else {
          throw new Error('No token in refresh response')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        const authStore = useAuthStore()
        authStore.logout()
        ElMessage.warning('登录已过期，请重新登录')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default instance
