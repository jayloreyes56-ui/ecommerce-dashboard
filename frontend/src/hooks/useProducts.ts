/**
 * useProducts — all product-related query and mutation hooks.
 *
 * Centralises cache key management, optimistic updates, and
 * error handling so pages stay declarative.
 */
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productsApi, type CreateProductPayload, type AdjustStockPayload } from '@/api/products'
import { getErrorMessage, applyServerErrors } from '@/lib/apiError'
import type { Product, ProductFilters } from '@/types'

// ─── Query keys (single source of truth) ─────────────────────────────────────

export const productKeys = {
  all:     ['products'] as const,
  list:    (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail:  (id: number) => ['products', 'detail', id] as const,
  logs:    (id: number) => ['products', 'logs', id] as const,
  categories: ['categories'] as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function useProductList(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.list(filters).then((r) => r.data),
    staleTime: 30_000,
    placeholderData: keepPreviousData,   // keeps old data visible while new page loads
  })
}

// ─── Single product ───────────────────────────────────────────────────────────

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id).then((r) => r.data.data),
    staleTime: 60_000,
    enabled: id > 0,
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productsApi.categories().then((r) => r.data.data),
    staleTime: 60 * 60 * 1000,   // 1 hour — categories rarely change
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateProductOptions {
  onSuccess?: (product: Product) => void
  setError?: (field: string, error: { message: string }) => void
}

export function useCreateProduct({ onSuccess, setError }: UseCreateProductOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productsApi.create(payload).then((r) => r.data.data),

    onSuccess: (product) => {
      toast.success(`"${product.name}" created.`)
      // Invalidate the list so the new product appears immediately
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      onSuccess?.(product)
    },

    onError: (err: unknown) => {
      if (setError) applyServerErrors(err, setError)
      toast.error(getErrorMessage(err, 'Failed to create product.'))
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateProductOptions {
  onSuccess?: (product: Product) => void
  setError?: (field: string, error: { message: string }) => void
}

export function useUpdateProduct({ onSuccess, setError }: UseUpdateProductOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateProductPayload> }) =>
      productsApi.update(id, payload).then((r) => r.data.data),

    // Optimistic update: immediately reflect the change in the detail cache
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
      const previous = queryClient.getQueryData<Product>(productKeys.detail(id))

      if (previous) {
        queryClient.setQueryData<Product>(productKeys.detail(id), {
          ...previous,
          ...payload,
        })
      }

      return { previous, id }
    },

    onSuccess: (product) => {
      toast.success(`"${product.name}" updated.`)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.setQueryData(productKeys.detail(product.id), product)
      onSuccess?.(product)
    },

    onError: (err: unknown, _vars, context) => {
      // Roll back the optimistic update
      if (context?.previous) {
        queryClient.setQueryData(productKeys.detail(context.id), context.previous)
      }
      if (setError) applyServerErrors(err, setError)
      toast.error(getErrorMessage(err, 'Failed to update product.'))
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),

    onSuccess: (_data, id) => {
      toast.success('Product deleted.')
      // Remove from detail cache immediately
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to delete product.'))
    },
  })
}

// ─── Stock adjustment ─────────────────────────────────────────────────────────

interface UseAdjustStockOptions {
  onSuccess?: () => void
}

export function useAdjustStock({ onSuccess }: UseAdjustStockOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdjustStockPayload }) =>
      productsApi.adjustStock(id, payload).then((r) => r.data),

    onSuccess: (_data, { id }) => {
      toast.success('Stock adjusted.')
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      onSuccess?.()
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to adjust stock.'))
    },
  })
}

// ─── Stock logs ───────────────────────────────────────────────────────────────

export function useStockLogs(productId: number, page = 1) {
  return useQuery({
    queryKey: productKeys.logs(productId),
    queryFn: () => productsApi.stockLogs(productId, page).then((r) => r.data),
    enabled: productId > 0,
    staleTime: 30_000,
  })
}
