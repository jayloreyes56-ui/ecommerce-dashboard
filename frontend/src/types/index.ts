// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  is_active: boolean
  roles: string[]
  last_login_at: string | null
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  sort_order: number
  parent: Category | null
  children: Category[]
}

export interface InventoryInfo {
  quantity: number
  reserved: number
  available: number
  low_stock_threshold: number
  is_low_stock: boolean
  is_out_of_stock: boolean
  updated_at: string | null
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  price: number
  cost_price?: number
  compare_price: number | null
  profit_margin?: number
  attributes: Record<string, string | number>
  images: Array<{ url: string; path: string }>
  is_active: boolean
  is_featured: boolean
  category: Category | null
  inventory: InventoryInfo | null
  available_stock: number
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  search?: string
  category_id?: number
  is_active?: boolean
  low_stock?: boolean
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderStatusHistory {
  id: number
  from_status: string | null
  to_status: string
  note: string | null
  changed_by: Pick<User, 'id' | 'name'> | null
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  subtotal: number
  discount: number
  tax: number
  shipping_cost: number
  total: number
  shipping_address: Address | null
  billing_address: Address | null
  notes: string | null
  customer: Customer
  assigned_to: User | null
  items: OrderItem[]
  status_history: OrderStatusHistory[]
  allowed_transitions: OrderStatus[]
  placed_at: string
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_id?: number
  from?: string
  to?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  address: Address | null
  status: 'active' | 'blocked'
  total_orders: number
  total_spent: number
  notes: string | null
  created_at: string
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  revenue: {
    today: number
    this_month: number
    last_month: number
  }
  orders: {
    today: number
    this_month: number
    pending: number
    processing: number
  }
  customers: {
    total: number
    new_today: number
  }
  low_stock_count: number
}

export interface SalesChartPoint {
  period: string
  order_count: number
  revenue: number
}

export interface TopProduct {
  id: number
  name: string
  sku: string
  total_quantity: number
  total_revenue: number
}

export interface SalesReport {
  summary: {
    total_orders: number
    total_revenue: number
    avg_order_value: number
    total_discounts: number
    total_tax: number
    total_shipping: number
  }
  chart: SalesChartPoint[]
  products: TopProduct[]
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: number
  body: string
  attachments: string[]
  is_internal: boolean
  is_from_staff: boolean
  sender_type: 'staff' | 'customer'
  sender: { id: number; name: string } | null
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: number
  subject: string | null
  status: 'open' | 'closed' | 'pending'
  channel: string
  customer: Customer
  assigned_to: User | null
  messages: Message[]
  last_message_at: string | null
  created_at: string
}
