import axios, { type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { isNetworkError } from './apiError'

// ─── Instance ─────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL) || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20_000,
})

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token and a unique request ID for tracing.

let requestCounter = 0

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Attach a lightweight request ID so server logs can correlate
  config.headers['X-Request-ID'] = `web-${++requestCounter}-${Date.now()}`

  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
// Handles global error cases. 422 validation errors are intentionally
// passed through so individual forms can display field-level messages.

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status  = error.response?.status as number | undefined
    const message = error.response?.data?.message as string | undefined

    // ── Network / timeout ────────────────────────────────────────────────────
    if (isNetworkError(error)) {
      toast.error('Network error — check your connection and try again.', {
        id: 'network-error',   // deduplicate repeated toasts
      })
      return Promise.reject(error)
    }

    // ── 401 Unauthenticated ──────────────────────────────────────────────────
    // Token expired or revoked. Clear local state and redirect to login.
    if (status === 401) {
      useAuthStore.getState().clearAuth()
      // Use replace so the user can't navigate back to a protected page
      window.location.replace('/login')
      return Promise.reject(error)
    }

    // ── 403 Forbidden ────────────────────────────────────────────────────────
    if (status === 403) {
      toast.error(message ?? 'You do not have permission to perform this action.')
      return Promise.reject(error)
    }

    // ── 422 Validation ───────────────────────────────────────────────────────
    // Pass through — forms call applyServerErrors() to display field messages.
    if (status === 422) {
      return Promise.reject(error)
    }

    // ── 404 Not Found ────────────────────────────────────────────────────────
    if (status === 404) {
      toast.error(message ?? 'Resource not found.')
      return Promise.reject(error)
    }

    // ── 429 Rate Limited ─────────────────────────────────────────────────────
    if (status === 429) {
      toast.error('Too many requests. Please slow down and try again.', {
        id: 'rate-limit',
      })
      return Promise.reject(error)
    }

    // ── 5xx Server Error ─────────────────────────────────────────────────────
    if (status !== undefined && status >= 500) {
      toast.error('A server error occurred. Our team has been notified.', {
        id: 'server-error',
      })
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
