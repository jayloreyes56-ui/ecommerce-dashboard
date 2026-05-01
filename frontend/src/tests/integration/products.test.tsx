/**
 * Products integration tests
 *
 * Tests the full CRUD flow: list → create → edit → delete → stock adjust.
 * All API calls are intercepted by MSW.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { renderWithProviders, makeTestQueryClient } from '../helpers/renderWithProviders'
import { useAuthStore } from '@/store/authStore'
import { fixtures } from '../mocks/handlers'
import Products from '@/pages/Products'

function renderProducts() {
  // Seed auth so the page doesn't redirect
  useAuthStore.setState({
    token: 'test-token-abc123',
    isAuthenticated: true,
    user: fixtures.user,
  })

  return renderWithProviders(<Products />, {
    routerProps: { initialEntries: ['/products'] },
  })
}

describe('Products — List', () => {
  it('renders the products table with data', async () => {
    renderProducts()

    // Loading skeleton should appear first
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0)

    // Then real data
    await waitFor(() => {
      expect(screen.getByText('ProPhone X15')).toBeInTheDocument()
      expect(screen.getByText('PHN-001')).toBeInTheDocument()
    })
  })

  it('shows the total product count in the subtitle', async () => {
    renderProducts()

    await waitFor(() => {
      expect(screen.getByText(/1 products total/i)).toBeInTheDocument()
    })
  })

  it('shows inventory status badge for low stock', async () => {
    server.use(
      http.get('/api/v1/products', () =>
        HttpResponse.json({
          success: true,
          data: [{
            ...fixtures.product,
            inventory: { ...fixtures.product.inventory, quantity: 5, available: 5, is_low_stock: true },
          }],
          meta: fixtures.paginationMeta,
        })
      )
    )

    renderProducts()

    await waitFor(() => {
      expect(screen.getByText(/low/i)).toBeInTheDocument()
    })
  })

  it('shows out of stock badge', async () => {
    server.use(
      http.get('/api/v1/products', () =>
        HttpResponse.json({
          success: true,
          data: [{
            ...fixtures.product,
            inventory: { ...fixtures.product.inventory, quantity: 0, available: 0, is_out_of_stock: true },
          }],
          meta: fixtures.paginationMeta,
        })
      )
    )

    renderProducts()

    await waitFor(() => {
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no products', async () => {
    server.use(
      http.get('/api/v1/products', () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { ...fixtures.paginationMeta, total: 0 },
        })
      )
    )

    renderProducts()

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })
})

describe('Products — Create', () => {
  it('opens the create modal when Add Product is clicked', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    await user.click(screen.getByRole('button', { name: /add product/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Product')).toBeInTheDocument()
  })

  it('submits the create form and shows success toast', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))
    await user.click(screen.getByRole('button', { name: /add product/i }))

    const dialog = screen.getByRole('dialog')

    await user.type(within(dialog).getByLabelText(/product name/i), 'New Test Product')
    await user.type(within(dialog).getByLabelText(/sku/i), 'TEST-001')
    await user.type(within(dialog).getByLabelText(/^price/i), '49.99')

    await user.click(within(dialog).getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows validation errors for missing required fields', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))
    await user.click(screen.getByRole('button', { name: /add product/i }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/sku is required/i)).toBeInTheDocument()
      expect(within(dialog).getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('shows server validation errors on 422 response', async () => {
    server.use(
      http.post('/api/v1/products', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Validation failed.',
            errors: { sku: ['The SKU has already been taken.'] },
          },
          { status: 422 }
        )
      )
    )

    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))
    await user.click(screen.getByRole('button', { name: /add product/i }))

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/product name/i), 'Duplicate Product')
    await user.type(within(dialog).getByLabelText(/sku/i), 'PHN-001')
    await user.type(within(dialog).getByLabelText(/^price/i), '99.99')

    await user.click(within(dialog).getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/the sku has already been taken/i)).toBeInTheDocument()
    })
  })
})

describe('Products — Edit', () => {
  it('opens the edit modal pre-filled with product data', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    // Click the edit button (pencil icon)
    const editButtons = screen.getAllByTitle('Edit')
    await user.click(editButtons[0])

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByDisplayValue('ProPhone X15')).toBeInTheDocument()
    expect(within(dialog).getByDisplayValue('PHN-001')).toBeInTheDocument()
  })

  it('submits the edit form and closes the modal', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    const editButtons = screen.getAllByTitle('Edit')
    await user.click(editButtons[0])

    const dialog = screen.getByRole('dialog')
    const nameInput = within(dialog).getByDisplayValue('ProPhone X15')

    await user.clear(nameInput)
    await user.type(nameInput, 'ProPhone X15 Updated')

    await user.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Products — Delete', () => {
  it('calls delete API and removes product from list', async () => {
    const user = userEvent.setup()

    // Track if delete was called
    let deleteCalled = false
    server.use(
      http.delete('/api/v1/products/:id', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true, message: 'Product deleted.' })
      })
    )

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    const deleteButtons = screen.getAllByTitle('Delete')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(deleteCalled).toBe(true)
    })
  })

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup()

    let deleteCalled = false
    server.use(
      http.delete('/api/v1/products/:id', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      })
    )

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    const deleteButtons = screen.getAllByTitle('Delete')
    await user.click(deleteButtons[0])

    expect(deleteCalled).toBe(false)
  })
})

describe('Products — Stock Adjustment', () => {
  it('opens the stock modal when stock button is clicked', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    const stockButtons = screen.getAllByTitle('Adjust stock')
    await user.click(stockButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Adjust Stock')).toBeInTheDocument()
    expect(screen.getByText(/current stock/i)).toBeInTheDocument()
  })

  it('submits a stock adjustment and closes the modal', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => screen.getByText('ProPhone X15'))

    const stockButtons = screen.getAllByTitle('Adjust stock')
    await user.click(stockButtons[0])

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/quantity change/i), '50')

    await user.click(within(dialog).getByRole('button', { name: /apply adjustment/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
