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
   * Decode a JWT payload segment. JWT uses base64url (RFC 7515): normalize
   * `-`/`_` back to standard base64 and restore missing `=` padding before
   * atob, then decode the bytes as UTF-8.
   */
  function decodeJwtPayload(raw: string): Record<string, unknown> | null {
    try {
      const segment = raw.split('.')[1]
      if (!segment) return null
      const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
      return JSON.parse(new TextDecoder().decode(bytes))
    } catch {
      return null
    }
  }

  /**
   * Decode the JWT payload (without verifying the signature — that's the
   * server's job) and check whether the token has expired.
   */
  const isTokenValid = computed(() => {
    if (!token.value) return false
    const payload = decodeJwtPayload(token.value)
    if (!payload) return false
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000
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

  /**
   * Clear local session. By default also ask the API to revoke the server
   * side refresh grace (P2-I); failures are swallowed so local cleanup and
   * redirect always happen. Pass `skipServer` when the token is already
   * known-invalid (e.g. a 401 from an auth endpoint) to avoid a pointless
   * doomed request.
   */
  async function logout(options?: { skipServer?: boolean }) {
    if (!options?.skipServer) {
      try {
        await authApi.logout()
      } catch {
        // 吊销失败不阻塞本地登出（token 可能已失效）
      }
    }
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
