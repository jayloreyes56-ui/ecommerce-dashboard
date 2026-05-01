import type { AxiosError } from 'axios'

/**
 * Shape of every error response from the Laravel backend.
 *
 * {
 *   "success": false,
 *   "message": "Validation failed.",
 *   "errors": { "email": ["The email field is required."] }
 * }
 */
export interface ApiErrorBody {
  success: false
  message: string
  errors?: Record<string, string[]>   // 422 field-level errors
  trace?: unknown                      // only present when APP_DEBUG=true
}

export type AppAxiosError = AxiosError<ApiErrorBody>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the top-level message from any thrown value.
 * Safe to call with unknown catch values.
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  const axiosErr = err as AppAxiosError
  return axiosErr?.response?.data?.message ?? fallback
}

/**
 * Extract field-level validation errors from a 422 response.
 * Returns a flat map of { fieldName: 'first error message' }.
 */
export function getValidationErrors(err: unknown): Record<string, string> {
  const axiosErr = err as AppAxiosError
  const raw = axiosErr?.response?.data?.errors ?? {}
  return Object.fromEntries(
    Object.entries(raw).map(([field, messages]) => [field, messages[0]])
  )
}

/**
 * Returns true if the error is a 422 Unprocessable Entity.
 */
export function isValidationError(err: unknown): boolean {
  return (err as AppAxiosError)?.response?.status === 422
}

/**
 * Returns true if the error is a 401 Unauthorized.
 */
export function isAuthError(err: unknown): boolean {
  return (err as AppAxiosError)?.response?.status === 401
}

/**
 * Returns true if the error is a 403 Forbidden.
 */
export function isForbiddenError(err: unknown): boolean {
  return (err as AppAxiosError)?.response?.status === 403
}

/**
 * Returns true if the error is a network/timeout error (no response received).
 */
export function isNetworkError(err: unknown): boolean {
  const axiosErr = err as AppAxiosError
  return axiosErr?.code === 'ECONNABORTED' || axiosErr?.code === 'ERR_NETWORK' || !axiosErr?.response
}

/**
 * Apply field-level validation errors from a 422 response onto a
 * react-hook-form setError function.
 *
 * Usage:
 *   } catch (err) {
 *     applyServerErrors(err, setError)
 *   }
 */
export function applyServerErrors(
  err: unknown,
  setError: (field: string, error: { message: string }) => void
): void {
  const errors = getValidationErrors(err)
  for (const [field, message] of Object.entries(errors)) {
    setError(field, { message })
  }
}
