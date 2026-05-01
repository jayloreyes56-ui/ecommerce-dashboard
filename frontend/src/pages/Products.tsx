import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react'
import { useProductList, useCategories, useDeleteProduct } from '@/hooks/useProducts'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Product, ProductFilters } from '@/types'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { StockAdjustModal } from '@/components/products/StockAdjustModal'
import { useSearchParams } from 'react-router-dom'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, per_page: 20 })
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)

  // Handle search from URL query parameter
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setSearch(searchQuery)
      setFilters((f) => ({ ...f, search: searchQuery, page: 1 }))
      // Clear the search param from URL after applying
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // ── Data fetching via hooks ───────────────────────────────────────────────
  const { data, isLoading } = useProductList(filters)
  const { data: categories } = useCategories()
  const deleteMutation = useDeleteProduct()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }))
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(product.id)
    }
  }

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categories?.map((c) => ({ value: c.id, label: c.name })) ?? []),
  ]

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            {p.images?.[0] ? (
              <img src={p.images[0].url} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <Package className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-400">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: Product) => (
        <span className="text-gray-600">{p.category?.name ?? '—'}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{formatCurrency(p.price)}</p>
          {p.compare_price && (
            <p className="text-xs text-gray-400 line-through">{formatCurrency(p.compare_price)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'inventory',
      header: 'Stock',
      render: (p: Product) => {
        const inv = p.inventory
        if (!inv) return <span className="text-gray-400">—</span>
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{inv.available}</span>
            {inv.is_out_of_stock && (
              <Badge variant="danger">Out of stock</Badge>
            )}
            {inv.is_low_stock && !inv.is_out_of_stock && (
              <Badge variant="warning">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Low
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: Product) => (
        <Badge variant={p.is_active ? 'success' : 'default'}>
          {p.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (p: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); setStockProduct(p) }}
            title="Adjust stock"
          >
            <Package className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); setEditProduct(p); setFormOpen(true) }}
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); handleDelete(p) }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Products"
      subtitle={`${data?.meta.total ?? 0} products total`}
      action={
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => { setEditProduct(null); setFormOpen(true) }}
        >
          Add Product
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 items-end gap-2 min-w-[200px]">
            <Input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>

          <Select
            options={categoryOptions}
            value={filters.category_id ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category_id: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="w-44"
          />

          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={filters.is_active === undefined ? '' : String(filters.is_active)}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                is_active: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              }))
            }
            className="w-36"
          />

          <Button
            variant={filters.low_stock ? 'primary' : 'outline'}
            size="md"
            icon={<Filter className="h-4 w-4" />}
            onClick={() =>
              setFilters((f) => ({ ...f, low_stock: !f.low_stock, page: 1 }))
            }
          >
            Low Stock
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        loading={isLoading}
        emptyMessage="No products found. Add your first product."
      />

      {data?.meta && (
        <Pagination
          meta={data.meta}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          className="mt-4"
        />
      )}

      {/* Modals */}
      <ProductFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        product={editProduct}
        categories={categories ?? []}
      />

      {stockProduct && (
        <StockAdjustModal
          open={!!stockProduct}
          onClose={() => setStockProduct(null)}
          product={stockProduct}
        />
      )}
    </PageWrapper>
  )
}
