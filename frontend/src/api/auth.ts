import api from '@/lib/axios'
import type { ApiResponse, User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),
}
