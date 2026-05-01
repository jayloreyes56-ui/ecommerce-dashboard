/**
 * Auth integration tests
 *
 * Tests the full login → token storage → protected route → logout flow
 * using MSW to intercept real Axios calls.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { useAuthStore } from '@/store/authStore'
import Login from '@/pages/Login'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderLogin() {
  return renderWithProviders(<Login />, {
    routerProps: { initialEntries: ['/login'] },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Auth — Login flow', () => {
  beforeEach(() => {
    // Reset Zustand store between tests
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  it('renders the login form', () => {
    renderLogin()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('shows field error for invalid email format', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('sets auth state on successful login', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'admin@company.com')
    await user.type(screen.getByLabelText(/password/i), 'Admin@1234')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.token).toBe('test-token-abc123')
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('admin@company.com')
    })
  })

  it('shows server error message on wrong credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'admin@company.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/the provided credentials are incorrect/i)).toBeInTheDocument()
    })
  })

  it('disables the submit button while loading', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'admin@company.com')
    await user.type(screen.getByLabelText(/password/i), 'Admin@1234')

    const button = screen.getByRole('button', { name: /sign in/i })
    await user.click(button)

    // Button should be disabled immediately after click
    expect(button).toBeDisabled()
  })

  it('clears auth state on 401 response', async () => {
    // Seed a token in the store
    useAuthStore.setState({ token: 'expired-token', isAuthenticated: true, user: null })

    // Override /me to return 401
    server.use(
      http.get('/api/v1/auth/me', () =>
        HttpResponse.json({ success: false, message: 'Unauthenticated.' }, { status: 401 })
      )
    )

    // Simulate a request that triggers the 401 interceptor
    const { default: api } = await import('@/lib/axios')
    try {
      await api.get('/auth/me')
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })
})

describe('Auth — Token handling', () => {
  it('attaches Authorization header to requests when token is set', async () => {
    useAuthStore.setState({ token: 'test-token-abc123', isAuthenticated: true, user: null })

    let capturedAuth: string | null = null

    server.use(
      http.get('/api/v1/auth/me', ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ success: true, data: { id: 1, name: 'Test' } })
      })
    )

    const { default: api } = await import('@/lib/axios')
    await api.get('/auth/me')

    expect(capturedAuth).toBe('Bearer test-token-abc123')
  })

  it('does not attach Authorization header when no token', async () => {
    useAuthStore.setState({ token: null, isAuthenticated: false, user: null })

    let capturedAuth: string | null = null

    server.use(
      http.get('/api/v1/auth/me', ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ success: true, data: {} })
      })
    )

    const { default: api } = await import('@/lib/axios')
    try { await api.get('/auth/me') } catch { /* ignore */ }

    expect(capturedAuth).toBeNull()
  })
})
