import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import api from '@/lib/axios'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Customer, PaginatedResponse } from '@/types'

export default function Customers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () =>
      api
        .get<PaginatedResponse<Customer>>('/customers', {
          params: { page, per_page: 20, search: search || undefined },
        })
        .then((r) => r.data),
    staleTime: 30_000,
  })

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{c.name}</p>
            <p className="text-xs text-gray-400">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (c: Customer) => c.phone ?? '—',
    },
    {
      key: 'total_orders',
      header: 'Orders',
      render: (c: Customer) => (
        <span className="font-medium text-gray-800">{c.total_orders}</span>
      ),
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      render: (c: Customer) => (
        <span className="font-semibold text-gray-900">{formatCurrency(c.total_spent)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Customer) => (
        <Badge variant={c.status === 'active' ? 'success' : 'danger'}>
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (c: Customer) => formatDate(c.created_at),
    },
  ]

  return (
    <PageWrapper
      title="Customers"
      subtitle={`${data?.meta.total ?? 0} customers total`}
    >
      <Card className="mb-5">
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
          className="flex gap-2"
        >
          <Input
            placeholder="Search by name, email or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Search
          </button>
        </form>
      </Card>

      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(c) => c.id}
        loading={isLoading}
        emptyMessage="No customers found."
      />

      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} className="mt-4" />
      )}
    </PageWrapper>
  )
}
