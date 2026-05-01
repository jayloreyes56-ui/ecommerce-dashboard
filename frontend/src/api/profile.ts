import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface UpdateProfileData {
  name: string
  email: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface NotificationSettings {
  email_orders: boolean
  email_messages: boolean
  email_reports: boolean
  push_orders: boolean
  push_messages: boolean
  push_low_stock: boolean
}

export const profileApi = {
  getProfile: () => 
    api.get<ApiResponse<any>>('/profile'),
  
  updateProfile: (data: UpdateProfileData) => 
    api.put<ApiResponse<any>>('/profile', data),
  
  changePassword: (data: ChangePasswordData) => 
    api.put<ApiResponse<any>>('/profile/password', data),
  
  getNotificationSettings: () => 
    api.get<ApiResponse<NotificationSettings>>('/profile/notifications'),
  
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => 
    api.put<ApiResponse<NotificationSettings>>('/profile/notifications', settings),
}
