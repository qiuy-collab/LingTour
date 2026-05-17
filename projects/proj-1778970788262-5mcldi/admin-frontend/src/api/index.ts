import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

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

    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
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

    if (body && typeof body === 'object') {
      if ('items' in body && Array.isArray((body as any).items)) {
        response.data = {
          code: 200,
          data: {
            items: (body as any).items,
            total: (body as any).total ?? (body as any).items.length,
            page: (body as any).page ?? 1,
            pageSize: (body as any).pageSize ?? (body as any).size ?? (body as any).limit ?? (body as any).items.length,
          },
          message: 'success',
        }
      } else if ('data' in body && Array.isArray((body as any).data)) {
        response.data = {
          code: 200,
          data: {
            items: (body as any).data,
            total: (body as any).total ?? (body as any).data.length,
            page: (body as any).page ?? 1,
            pageSize: (body as any).pageSize ?? (body as any).size ?? (body as any).limit ?? (body as any).data.length,
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
