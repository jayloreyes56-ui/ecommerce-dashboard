import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { reportsApi } from '@/api/reports'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'

const PERIOD_OPTIONS = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

export default function Dashboard() {
  const [period, setPeriod] = useState(30)

  const from = format(subDays(new Date(), period), 'yyyy-MM-dd')
  const to   = format(new Date(), 'yyyy-MM-dd')

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => reportsApi.summary().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['sales-chart', from, to],
    queryFn: () => reportsApi.salesChart(from, to, period <= 30 ? 'day' : 'week').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })

  const { data: topProducts } = useQuery({
    queryKey: ['top-products', from, to],
    queryFn: () => reportsApi.topProducts(from, to, 5).then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })

  const summary = summaryData

  return (
    <PageWrapper title="Dashboard" subtitle="Welcome back — here's what's happening today.">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(summary?.revenue.this_month ?? 0)}
          subtitle={`Today: ${formatCurrency(summary?.revenue.today ?? 0)}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          loading={summaryLoading}
          trend={{ value: 12.5, label: 'vs last month' }}
        />
        <StatCard
          title="Orders This Month"
          value={formatNumber(summary?.orders.this_month ?? 0)}
          subtitle={`Today: ${summary?.orders.today ?? 0} new`}
          icon={ShoppingCart}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          loading={summaryLoading}
          trend={{ value: 8.2, label: 'vs last month' }}
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(summary?.customers.total ?? 0)}
          subtitle={`${summary?.customers.new_today ?? 0} new today`}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          loading={summaryLoading}
          trend={{ value: 3.1, label: 'vs last month' }}
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.low_stock_count ?? 0}
          subtitle="Require attention"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          loading={summaryLoading}
        />
      </div>

      {/* Order Status Row */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending',    value: summary?.orders.pending ?? 0,    color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Processing', value: summary?.orders.processing ?? 0, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-3 py-3">
            <div className={`rounded-lg p-2 ${item.bg}`}>
              <ShoppingCart className={`h-4 w-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2" padding="none">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <CardHeader title="Revenue Overview" subtitle="Sales trend over time" />
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setPeriod(opt.days)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === opt.days
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {chartLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Top Products" subtitle="By revenue" />
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts?.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.total_quantity} units</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.total_revenue)}
                </span>
              </div>
            ))}
            {!topProducts && (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Orders by day bar chart */}
      <div className="mt-6">
        <Card padding="none">
          <div className="border-b border-gray-100 px-5 py-4">
            <CardHeader title="Orders Volume" subtitle="Number of orders per period" />
          </div>
          <div className="p-5">
            {chartLoading ? (
              <div className="h-48 animate-pulse rounded-lg bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Bar dataKey="order_count" name="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
