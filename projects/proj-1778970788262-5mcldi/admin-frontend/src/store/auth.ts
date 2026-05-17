import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types/auth'
import { authApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AdminUser | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function login(username: string, password: string) {
    // 兼容后端真实接口，传递 email
    const res = await authApi.login({ username, email: username, password })

    // 适配真实后端与 Mock 的不同响应格式
    const responseData = res.data as any
    const newToken = responseData.data?.token || responseData.access_token
    const newUser = responseData.data?.user || responseData.user

    if (!newToken || !newUser) {
      throw new Error('Invalid response format')
    }

    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
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
    currentUser,
    login,
    logout,
  }
})
