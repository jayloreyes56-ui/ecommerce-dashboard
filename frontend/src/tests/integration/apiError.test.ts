/**
 * API error utility tests
 *
 * Unit tests for the error parsing helpers — no rendering needed.
 */
import { describe, it, expect } from 'vitest'
import {
  getErrorMessage,
  getValidationErrors,
  isValidationError,
  isAuthError,
  isForbiddenError,
  isNetworkError,
  applyServerErrors,
} from '@/lib/apiError'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const make422 = (errors: Record<string, string[]> = {}) => ({
  response: {
    status: 422,
    data: {
      success: false as const,
      message: 'Validation failed.',
      errors,
    },
  },
})

const make401 = () => ({
  response: { status: 401, data: { success: false as const, message: 'Unauthenticated.' } },
})

const make403 = () => ({
  response: { status: 403, data: { success: false as const, message: 'Forbidden.' } },
})

const makeNetworkError = () => ({
  code: 'ERR_NETWORK',
  response: undefined,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getErrorMessage', () => {
  it('extracts message from API response', () => {
    const err = make422()
    expect(getErrorMessage(err)).toBe('Validation failed.')
  })

  it('returns fallback when no response', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.')
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred.')
  })

  it('returns custom fallback', () => {
    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
  })
})

describe('getValidationErrors', () => {
  it('returns flat map of first error per field', () => {
    const err = make422({
      email:    ['The email field is required.', 'Must be a valid email.'],
      password: ['The password field is required.'],
    })

    const result = getValidationErrors(err)

    expect(result).toEqual({
      email:    'The email field is required.',
      password: 'The password field is required.',
    })
  })

  it('returns empty object when no errors', () => {
    expect(getValidationErrors(make422())).toEqual({})
    expect(getValidationErrors(null)).toEqual({})
  })
})

describe('isValidationError', () => {
  it('returns true for 422', () => {
    expect(isValidationError(make422())).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(isValidationError(make401())).toBe(false)
    expect(isValidationError(null)).toBe(false)
  })
})

describe('isAuthError', () => {
  it('returns true for 401', () => {
    expect(isAuthError(make401())).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(isAuthError(make422())).toBe(false)
  })
})

describe('isForbiddenError', () => {
  it('returns true for 403', () => {
    expect(isForbiddenError(make403())).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(isForbiddenError(make401())).toBe(false)
  })
})

describe('isNetworkError', () => {
  it('returns true when no response', () => {
    expect(isNetworkError(makeNetworkError())).toBe(true)
  })

  it('returns true for ECONNABORTED', () => {
    expect(isNetworkError({ code: 'ECONNABORTED', response: undefined })).toBe(true)
  })

  it('returns false when response exists', () => {
    expect(isNetworkError(make422())).toBe(false)
  })
})

describe('applyServerErrors', () => {
  it('calls setError for each field in the 422 response', () => {
    const err = make422({
      email:    ['The email is taken.'],
      password: ['Too short.'],
    })

    const calls: Array<[string, { message: string }]> = []
    const setError = (field: string, error: { message: string }) => {
      calls.push([field, error])
    }

    applyServerErrors(err, setError as Parameters<typeof applyServerErrors>[1])

    expect(calls).toContainEqual(['email', { message: 'The email is taken.' }])
    expect(calls).toContainEqual(['password', { message: 'Too short.' }])
  })

  it('does nothing when no errors', () => {
    const calls: unknown[] = []
    const setError = (...args: unknown[]) => calls.push(args)

    applyServerErrors(null, setError as Parameters<typeof applyServerErrors>[1])

    expect(calls).toHaveLength(0)
  })
})
