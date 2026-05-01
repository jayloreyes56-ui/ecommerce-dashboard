/**
 * Orders integration tests
 *
 * Tests list rendering, status transitions, cancellation, and
 * the order detail modal.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { useAuthStore } from '@/store/authStore'
import { fixtures } from '../mocks/handlers'
import Orders from '@/pages/Orders'

function renderOrders() {
  useAuthStore.setState({
    token: 'test-token-abc123',
    isAuthenticated: true,
    user: fixtures.user,
  })

  return renderWithProviders(<Orders />, {
    routerProps: { initialEntries: ['/orders'] },
  })
}

describe('Orders — List', () => {
  it('renders the orders table', async () => {
    renderOrders()

    await waitFor(() => {
      expect(screen.getByText('ORD-20240115-0001')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  it('shows order total formatted as currency', async () => {
    renderOrders()

    await waitFor(() => {
      expect(screen.getByText('$1,088.91')).toBeInTheDocument()
    })
  })

  it('shows status badge for pending order', async () => {
    renderOrders()

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('shows payment status badge', async () => {
    renderOrders()

    await waitFor(() => {
      expect(screen.getByText('Unpaid')).toBeInTheDocument()
    })
  })

  it('shows empty state when no orders', async () => {
    server.use(
      http.get('/api/v1/orders', () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { ...fixtures.paginationMeta, total: 0 },
        })
      )
    )

    renderOrders()

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument()
    })
  })
})

describe('Orders — Detail Modal', () => {
  it('opens the detail modal when a row is clicked', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))

    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Order Details')).toBeInTheDocument()
    })
  })

  it('shows order items in the detail modal', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('ProPhone X15')).toBeInTheDocument()
      expect(within(dialog).getByText(/PHN-001/)).toBeInTheDocument()
    })
  })

  it('shows allowed status transition buttons', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('button', { name: /confirmed/i })).toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: /cancelled/i })).toBeInTheDocument()
    })
  })

  it('shows order totals breakdown', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('Subtotal')).toBeInTheDocument()
      expect(within(dialog).getByText('Tax')).toBeInTheDocument()
      expect(within(dialog).getByText('Shipping')).toBeInTheDocument()
    })
  })

  it('closes the modal when X is clicked', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Orders — Status Transitions', () => {
  it('updates order status when transition button is clicked', async () => {
    const user = userEvent.setup()

    let capturedStatus: string | null = null
    server.use(
      http.patch('/api/v1/orders/:id/status', async ({ request }) => {
        const body = await request.json() as { status: string }
        capturedStatus = body.status
        return HttpResponse.json({
          success: true,
          data: { ...fixtures.order, status: body.status, allowed_transitions: [] },
        })
      })
    )

    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => screen.getByRole('dialog'))

    const confirmButton = screen.getByRole('button', { name: /confirmed/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(capturedStatus).toBe('confirmed')
    })
  })
})

describe('Orders — Cancellation', () => {
  it('shows cancel input when Cancel Order is clicked', async () => {
    const user = userEvent.setup()
    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /cancel order/i }))

    expect(screen.getByPlaceholderText(/reason for cancellation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm cancel/i })).toBeInTheDocument()
  })

  it('submits cancellation with reason', async () => {
    const user = userEvent.setup()

    let capturedReason: string | null = null
    server.use(
      http.post('/api/v1/orders/:id/cancel', async ({ request }) => {
        const body = await request.json() as { reason: string }
        capturedReason = body.reason
        return HttpResponse.json({
          success: true,
          data: { ...fixtures.order, status: 'cancelled', allowed_transitions: [] },
        })
      })
    )

    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /cancel order/i }))
    await user.type(screen.getByPlaceholderText(/reason for cancellation/i), 'Customer requested')
    await user.click(screen.getByRole('button', { name: /confirm cancel/i }))

    await waitFor(() => {
      expect(capturedReason).toBe('Customer requested')
    })
  })

  it('does not submit cancellation without a reason', async () => {
    const user = userEvent.setup()

    let cancelCalled = false
    server.use(
      http.post('/api/v1/orders/:id/cancel', () => {
        cancelCalled = true
        return HttpResponse.json({ success: true, data: fixtures.order })
      })
    )

    renderOrders()

    await waitFor(() => screen.getByText('ORD-20240115-0001'))
    await user.click(screen.getByText('ORD-20240115-0001'))

    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /cancel order/i }))
    // Don't type a reason
    await user.click(screen.getByRole('button', { name: /confirm cancel/i }))

    expect(cancelCalled).toBe(false)
  })
})

describe('Orders — Filtering', () => {
  it('sends status filter to the API', async () => {
    const user = userEvent.setup()

    let capturedParams: URLSearchParams | null = null
    server.use(
      http.get('/api/v1/orders', ({ request }) => {
        capturedParams = new URL(request.url).searchParams
        return HttpResponse.json({
          success: true,
          data: [],
          meta: { ...fixtures.paginationMeta, total: 0 },
        })
      })
    )

    renderOrders()

    await waitFor(() => screen.getByRole('combobox'))

    const statusSelect = screen.getByRole('combobox')
    await user.selectOptions(statusSelect, 'pending')

    await waitFor(() => {
      expect(capturedParams?.get('status')).toBe('pending')
    })
  })
})
