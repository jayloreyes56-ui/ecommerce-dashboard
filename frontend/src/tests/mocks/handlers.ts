/**
 * MSW (Mock Service Worker) request handlers.
 *
 * These intercept real HTTP calls during tests and return
 * controlled responses — no real backend needed.
 */
import { http, HttpResponse } from 'msw'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export const fixtures = {
  user: {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    avatar: null,
    is_active: true,
    roles: ['admin'],
    last_login_at: '2024-01-15T10:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
  },

  product: {
    id: 1,
    sku: 'PHN-001',
    name: 'ProPhone X15',
    description: 'Flagship smartphone',
    price: 999.00,
    cost_price: 620.00,
    compare_price: null,
    attributes: { color: 'Black', storage: '256GB' },
    images: [],
    is_active: true,
    is_featured: true,
    category: { id: 1, name: 'Smartphones', slug: 'smartphones', description: null, is_active: true, sort_order: 0, parent: null, children: [] },
    inventory: {
      quantity: 150,
      reserved: 5,
      available: 145,
      low_stock_threshold: 10,
      is_low_stock: false,
      is_out_of_stock: false,
      updated_at: '2024-01-15T10:00:00.000Z',
    },
    available_stock: 145,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
  },

  order: {
    id: 1,
    order_number: 'ORD-20240115-0001',
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: null,
    subtotal: 999.00,
    discount: 0,
    tax: 79.92,
    shipping_cost: 9.99,
    total: 1088.91,
    shipping_address: { street: '123 Main St', city: 'New York', state: 'NY', country: 'US' },
    billing_address: null,
    notes: null,
    customer: {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0101',
      address: null,
      status: 'active',
      total_orders: 3,
      total_spent: 2500.00,
      notes: null,
      created_at: '2024-01-01T00:00:00.000Z',
    },
    assigned_to: null,
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: 'ProPhone X15',
        product_sku: 'PHN-001',
        quantity: 1,
        unit_price: 999.00,
        total_price: 999.00,
      },
    ],
    status_history: [
      {
        id: 1,
        from_status: null,
        to_status: 'pending',
        note: 'Order created',
        changed_by: { id: 1, name: 'Admin User' },
        created_at: '2024-01-15T10:00:00.000Z',
      },
    ],
    allowed_transitions: ['confirmed', 'cancelled'],
    placed_at: '2024-01-15T10:00:00.000Z',
    confirmed_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
  },

  paginationMeta: {
    current_page: 1,
    per_page: 20,
    total: 1,
    last_page: 1,
  },
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'admin@company.com' && body.password === 'Admin@1234') {
      return HttpResponse.json({
        success: true,
        data: { token: 'test-token-abc123', user: fixtures.user },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Validation failed.',
        errors: { email: ['The provided credentials are incorrect.'] },
      },
      { status: 422 }
    )
  }),

  http.post('/api/v1/auth/logout', () =>
    HttpResponse.json({ success: true, message: 'Logged out successfully.' })
  ),

  http.get('/api/v1/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ success: false, message: 'Unauthenticated.' }, { status: 401 })
    }
    return HttpResponse.json({ success: true, data: fixtures.user })
  }),

  // ── Products ──────────────────────────────────────────────────────────────

  http.get('/api/v1/products', () =>
    HttpResponse.json({
      success: true,
      data: [fixtures.product],
      meta: fixtures.paginationMeta,
    })
  ),

  http.get('/api/v1/products/:id', ({ params }) => {
    if (Number(params.id) === fixtures.product.id) {
      return HttpResponse.json({ success: true, data: fixtures.product })
    }
    return HttpResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
  }),

  http.post('/api/v1/products', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      {
        success: true,
        data: { ...fixtures.product, ...body, id: 99 },
        message: 'Product created successfully.',
      },
      { status: 201 }
    )
  }),

  http.put('/api/v1/products/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      success: true,
      data: { ...fixtures.product, ...body, id: Number(params.id) },
      message: 'Product updated successfully.',
    })
  }),

  http.delete('/api/v1/products/:id', () =>
    HttpResponse.json({ success: true, message: 'Product deleted successfully.' })
  ),

  http.post('/api/v1/products/:id/stock', async ({ params, request }) => {
    const body = await request.json() as { change: number }
    const newQty = fixtures.product.inventory!.quantity + body.change
    return HttpResponse.json({
      success: true,
      data: { ...fixtures.product.inventory, quantity: newQty, available: newQty - 5 },
      message: 'Stock adjusted successfully.',
    })
  }),

  http.get('/api/v1/categories', () =>
    HttpResponse.json({
      success: true,
      data: [fixtures.product.category],
    })
  ),

  // ── Orders ────────────────────────────────────────────────────────────────

  http.get('/api/v1/orders', () =>
    HttpResponse.json({
      success: true,
      data: [fixtures.order],
      meta: fixtures.paginationMeta,
    })
  ),

  http.get('/api/v1/orders/:id', ({ params }) => {
    if (Number(params.id) === fixtures.order.id) {
      return HttpResponse.json({ success: true, data: fixtures.order })
    }
    return HttpResponse.json({ success: false, message: 'Order not found.' }, { status: 404 })
  }),

  http.patch('/api/v1/orders/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: string }
    return HttpResponse.json({
      success: true,
      data: {
        ...fixtures.order,
        id: Number(params.id),
        status: body.status,
        allowed_transitions: [],
      },
      message: `Order status updated to [${body.status}].`,
    })
  }),

  http.post('/api/v1/orders/:id/cancel', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    return HttpResponse.json({
      success: true,
      data: {
        ...fixtures.order,
        id: Number(params.id),
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        allowed_transitions: [],
      },
      message: 'Order cancelled.',
    })
  }),

  // ── Dashboard ─────────────────────────────────────────────────────────────

  http.get('/api/v1/dashboard/summary', () =>
    HttpResponse.json({
      success: true,
      data: {
        revenue: { today: 1250.00, this_month: 48320.00, last_month: 43100.00 },
        orders:  { today: 12, this_month: 340, pending: 8, processing: 5 },
        customers: { total: 1240, new_today: 3 },
        low_stock_count: 4,
      },
    })
  ),
]
