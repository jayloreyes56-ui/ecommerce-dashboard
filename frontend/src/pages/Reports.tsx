import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, startOfMonth } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { reportsApi } from '@/api/reports'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { TopProduct } from '@/types'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626']

export default function Reports() {
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')

  const { data: report, isLoading } = useQuery({
    queryKey: ['sales-report', from, to, groupBy],
    queryFn: () => reportsApi.salesReport(from, to, groupBy).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!from && !!to,
  })

  const { data: customerReport } = useQuery({
    queryKey: ['customer-report', from, to],
    queryFn: () => reportsApi.customerReport(from, to).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!from && !!to,
  })

  const summary = report?.summary

  const productColumns = [
    { key: 'rank', header: '#', render: (p: TopProduct) => (report?.products?.indexOf(p) ?? 0) + 1 },
    { key: 'name', header: 'Product', render: (p: TopProduct) => (
      <div>
        <p className="font-medium text-gray-800">{p.name}</p>
        <p className="text-xs text-gray-400">{p.sku}</p>
      </div>
    )},
    { key: 'total_quantity', header: 'Units Sold', render: (p: TopProduct) => formatNumber(p.total_quantity) },
    { key: 'total_revenue',  header: 'Revenue',    render: (p: TopProduct) => formatCurrency(p.total_revenue) },
  ]

  return (
    <PageWrapper title="Sales & Reports" subtitle="Analyze your business performance">
      {/* Date Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-44"
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-44"
          />
          <Select
            label="Group By"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
            options={[
              { value: 'day',   label: 'Daily' },
              { value: 'week',  label: 'Weekly' },
              { value: 'month', label: 'Monthly' },
            ]}
            className="w-36"
          />
          <div className="flex gap-2">
            {[
              { label: 'This Month', fn: () => { setFrom(format(startOfMonth(new Date()), 'yyyy-MM-dd')); setTo(format(new Date(), 'yyyy-MM-dd')) } },
              { label: 'Last 30d',   fn: () => { setFrom(format(subDays(new Date(), 30), 'yyyy-MM-dd')); setTo(format(new Date(), 'yyyy-MM-dd')) } },
              { label: 'Last 90d',   fn: () => { setFrom(format(subDays(new Date(), 90), 'yyyy-MM-dd')); setTo(format(new Date(), 'yyyy-MM-dd')) } },
            ].map((p) => (
              <button
                key={p.label}
                onClick={p.fn}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Revenue',   value: formatCurrency(summary?.total_revenue ?? 0) },
          { label: 'Total Orders',    value: formatNumber(summary?.total_orders ?? 0) },
          { label: 'Avg Order Value', value: formatCurrency(summary?.avg_order_value ?? 0) },
          { label: 'Total Discounts', value: formatCurrency(summary?.total_discounts ?? 0) },
          { label: 'Total Tax',       value: formatCurrency(summary?.total_tax ?? 0) },
          { label: 'Total Shipping',  value: formatCurrency(summary?.total_shipping ?? 0) },
        ].map((item) => (
          <Card key={item.label} className="text-center">
            {isLoading ? (
              <div className="h-8 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Revenue Trend" />
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={report?.chart ?? []}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Orders Volume" />
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={report?.chart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="order_count" name="Orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Top Products + Pie */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Top Products by Revenue" />
          </div>
          <div className="p-5">
            <Table
              columns={productColumns}
              data={report?.products ?? []}
              keyExtractor={(p) => p.id}
              loading={isLoading}
              emptyMessage="No product data for this period."
            />
          </div>
        </Card>

        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Revenue Share" subtitle="Top 5 products" />
          </div>
          <div className="flex items-center justify-center p-5">
            {report?.products && report.products.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={report.products.slice(0, 5)}
                    dataKey="total_revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {report.products.slice(0, 5).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 animate-pulse rounded bg-gray-50 w-full" />
            )}
          </div>
        </Card>
      </div>

      {/* Top Customers */}
      {customerReport && (
        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Top Customers" subtitle="By total spend in period" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Customer', 'Email', 'Orders', 'Total Spent', 'Avg Order'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(customerReport as Array<{id: number; name: string; email: string; order_count: number; total_spent: number; avg_order_value: number}>).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.order_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(c.total_spent)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(c.avg_order_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageWrapper>
  )
}
