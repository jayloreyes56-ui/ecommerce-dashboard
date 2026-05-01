import api from '@/lib/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Category,
  ProductFilters,
} from '@/types'

export interface CreateProductPayload {
  category_id?: number
  sku: string
  name: string
  description?: string
  price: number
  cost_price?: number
  compare_price?: number
  attributes?: Record<string, string | number>
  is_active?: boolean
  is_featured?: boolean
  initial_stock?: number
}

export interface AdjustStockPayload {
  change: number
  reason: 'restock' | 'adjustment' | 'damage' | 'return' | 'other'
  note?: string
}

export const productsApi = {
  list: (filters: ProductFilters = {}) =>
    api.get<PaginatedResponse<Product>>('/products', { params: filters }),

  get: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    api.post<ApiResponse<Product>>('/products', payload),

  update: (id: number, payload: Partial<CreateProductPayload>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/products/${id}`),

  adjustStock: (id: number, payload: AdjustStockPayload) =>
    api.post(`/products/${id}/stock`, payload),

  stockLogs: (id: number, page = 1) =>
    api.get(`/products/${id}/stock/logs`, { params: { page } }),

  categories: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
}
