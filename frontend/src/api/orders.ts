import api from '@/lib/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
} from '@/types'

export interface CreateOrderPayload {
  customer_id: number
  assigned_to?: number
  payment_method?: string
  discount?: number
  tax?: number
  shipping_cost?: number
  shipping_address?: Record<string, string>
  notes?: string
  items: Array<{ product_id: number; quantity: number }>
}

export const ordersApi = {
  list: (filters: OrderFilters = {}) =>
    api.get<PaginatedResponse<Order>>('/orders', { params: filters }),

  get: (id: number) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),

  create: (payload: CreateOrderPayload) =>
    api.post<ApiResponse<Order>>('/orders', payload),

  updateStatus: (id: number, status: OrderStatus, note?: string) =>
    api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status, note }),

  updatePayment: (id: number, payment_status: PaymentStatus, payment_reference?: string) =>
    api.patch<ApiResponse<Order>>(`/orders/${id}/payment`, { payment_status, payment_reference }),

  cancel: (id: number, reason: string) =>
    api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  history: (id: number) =>
    api.get(`/orders/${id}/history`),
}
