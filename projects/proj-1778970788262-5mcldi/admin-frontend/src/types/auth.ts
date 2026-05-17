// 认证相关类型

export interface LoginRequest {
  username?: string
  email?: string
  password: string
}

export interface AdminUser {
  id: string
  username: string
  name: string
  avatar?: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}
