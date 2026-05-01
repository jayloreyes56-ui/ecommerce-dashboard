import { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { useOrderList } from '@/hooks/useOrders'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDateTime, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/utils'
import type { Order, OrderFilters, OrderStatus } from '@/types'
import { OrderDetailModal } from '@/components/orders/OrderDetailModal'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'refunded',   label: 'Refunded' },
]

export default function Orders() {
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, per_page: 20 })
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useOrderList(filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }))
  }

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (o: Order) => (
        <div>
          <p className="font-mono text-sm font-semibold text-gray-900">{o.order_number}</p>
          <p className="text-xs text-gray-400">{formatDateTime(o.placed_at)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o: Order) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={o.customer.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{o.customer.name}</p>
            <p className="text-xs text-gray-400">{o.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o: Order) => (
        <span className="text-sm text-gray-600">
          {o.items?.length ?? 0} item{(o.items?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: Order) => (
        <span className="font-semibold text-gray-900">{formatCurrency(o.total)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => (
        <StatusBadge status={o.status} config={ORDER_STATUS_CONFIG} />
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (o: Order) => (
        <StatusBadge status={o.payment_status} config={PAYMENT_STATUS_CONFIG} />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (o: Order) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(o) }}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Orders"
      subtitle={`${data?.meta.total ?? 0} orders total`}
    >
      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 items-end gap-2 min-w-[200px]">
            <Input
              placeholder="Search by order # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="flex-1"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <Select
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value as OrderStatus) || undefined,
                page: 1,
              }))
            }
            className="w-44"
          />

          <Input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined, page: 1 }))}
            className="w-40"
          />
          <Input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined, page: 1 }))}
            className="w-40"
          />
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(o) => o.id}
        loading={isLoading}
        emptyMessage="No orders found."
        onRowClick={(o) => setSelectedOrder(o)}
      />

      {data?.meta && (
        <Pagination
          meta={data.meta}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          className="mt-4"
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          orderId={selectedOrder.id}
        />
      )}
    </PageWrapper>
  )
}
