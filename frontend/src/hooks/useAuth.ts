/**
 * useAuth — wraps all authentication flows with loading/error state.
 *
 * Keeps Login.tsx and ProtectedRoute.tsx thin: they call these hooks
 * instead of calling the API directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi, type LoginPayload } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { applyServerErrors, getErrorMessage } from '@/lib/apiError'

// ─── Re-hydrate user from token on app load ───────────────────────────────────

export function useMe() {
  const { token, isAuthenticated, setAuth } = useAuthStore()

  return useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await authApi.me()
      setAuth(res.data.data, token!)
      return res.data.data
    },
    // Only run when we have a token but haven't loaded the user yet
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────

interface UseLoginOptions {
  setError: (field: string, error: { message: string }) => void
}

export function useLogin({ setError }: UseLoginOptions) {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),

    onSuccess: ({ data }) => {
      const { token, user } = data.data
      setAuth(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/', { replace: true })
    },

    onError: (err: unknown) => {
      // Apply field-level errors (e.g. wrong password → email field)
      applyServerErrors(err, setError)

      // If no field errors were returned, show a generic toast
      const hasFieldErrors = !!(err as { response?: { data?: { errors?: unknown } } })
        ?.response?.data?.errors
      if (!hasFieldErrors) {
        toast.error(getErrorMessage(err, 'Login failed. Check your credentials.'))
      }
    },
  })
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSettled: () => {
      // Always clear local state, even if the server call fails
      clearAuth()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
