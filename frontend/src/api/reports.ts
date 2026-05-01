import api from '@/lib/axios'
import type { ApiResponse, DashboardSummary, SalesChartPoint, TopProduct, SalesReport } from '@/types'

export const reportsApi = {
  summary: () =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary'),

  salesChart: (from: string, to: string, group_by: 'day' | 'week' | 'month' = 'day') =>
    api.get<ApiResponse<SalesChartPoint[]>>('/dashboard/sales-chart', {
      params: { from, to, group_by },
    }),

  topProducts: (from: string, to: string, limit = 10, metric: 'revenue' | 'quantity' = 'revenue') =>
    api.get<ApiResponse<TopProduct[]>>('/dashboard/top-products', {
      params: { from, to, limit, metric },
    }),

  salesReport: (from: string, to: string, group_by: 'day' | 'week' | 'month' = 'day') =>
    api.get<ApiResponse<SalesReport>>('/reports/sales', {
      params: { from, to, group_by },
    }),

  customerReport: (from: string, to: string, limit = 20) =>
    api.get('/reports/customers', { params: { from, to, limit } }),
}
