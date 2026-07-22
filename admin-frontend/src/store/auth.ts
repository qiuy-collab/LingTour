import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, LoginResponse } from '@/types/auth'
import { authApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AdminUser | null>(
    (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null')
      } catch {
        localStorage.removeItem('user')
        return null
      }
    })(),
  )

  // Getters
  /**
   * Decode the JWT payload (without verifying the signature — that's the
   * server's job) and check whether the token has expired.
   */
  const isTokenValid = computed(() => {
    if (!token.value) return false
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000
    } catch {
      return false
    }
  })

  const isLoggedIn = computed(() => !!token.value && isTokenValid.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    // 后端 /api/v1/auth/login 响应不走 ApiResponse 包装，直接返回 LoginResponse
    const responseData = res.data as unknown as LoginResponse
    const { access_token, user: loginUser } = responseData

    if (!access_token || !loginUser) {
      throw new Error('Invalid response format')
    }

    if (loginUser.role !== 'admin' && loginUser.role !== 'editor') {
      throw new Error('该账号没有后台管理权限')
    }

    token.value = access_token
    user.value = loginUser as AdminUser
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(loginUser))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    token,
    user,
    isLoggedIn,
    isTokenValid,
    currentUser,
    login,
    logout,
  }
})
