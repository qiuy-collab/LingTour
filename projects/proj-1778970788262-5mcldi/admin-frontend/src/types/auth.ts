// 认证相关类型

export interface LoginRequest {
  email: string
  password: string
}

export interface AdminUser {
  id: string
  accountId: string
  email: string
  name: string
  role: 'admin' | 'editor'
}

export interface LoginResponse {
  access_token: string
  expires_in: string
  user: AdminUser
}
