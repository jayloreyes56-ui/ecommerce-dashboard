import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type UpdateProfileData, type ChangePasswordData, type NotificationSettings } from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      const user = response.data.data
      setUser(user)
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully. Other sessions have been logged out.')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password'
      const errors = error.response?.data?.errors
      
      if (errors?.current_password) {
        toast.error(errors.current_password[0])
      } else {
        toast.error(message)
      }
    },
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => profileApi.getNotificationSettings().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) => 
      profileApi.updateNotificationSettings(settings),
    onSuccess: (response) => {
      queryClient.setQueryData(['notification-settings'], response.data.data)
      toast.success('Notification settings updated')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update settings'
      toast.error(message)
    },
  })
}
