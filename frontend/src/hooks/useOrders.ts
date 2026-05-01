/**
 * useOrders — all order-related query and mutation hooks.
 *
 * Handles optimistic status updates so the UI feels instant
 * even before the server confirms the change.
 */
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ordersApi, type CreateOrderPayload } from '@/api/orders'
import { getErrorMessage, applyServerErrors } from '@/lib/apiError'
import type { Order, OrderFilters, OrderStatus, PaymentStatus } from '@/types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
  all:    ['orders'] as const,
  list:   (filters: OrderFilters) => ['orders', 'list', filters] as const,
  detail: (id: number) => ['orders', 'detail', id] as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function useOrderList(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersApi.list(filters).then((r) => r.data),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

// ─── Single order ─────────────────────────────────────────────────────────────

export function useOrder(id: number, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id).then((r) => r.data.data),
    staleTime: 30_000,
    enabled: enabled && id > 0,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateOrderOptions {
  onSuccess?: (order: Order) => void
  setError?: (field: string, error: { message: string }) => void
}

export function useCreateOrder({ onSuccess, setError }: UseCreateOrderOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      ordersApi.create(payload).then((r) => r.data.data),

    onSuccess: (order) => {
      toast.success(`Order ${order.order_number} created.`)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      onSuccess?.(order)
    },

    onError: (err: unknown) => {
      if (setError) applyServerErrors(err, setError as Parameters<typeof applyServerErrors>[1])
      toast.error(getErrorMessage(err, 'Failed to create order.'))
    },
  })
}

// ─── Update status ────────────────────────────────────────────────────────────

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: number
      status: OrderStatus
      note?: string
    }) => ordersApi.updateStatus(id, status, note).then((r) => r.data.data),

    // Optimistic update: flip the status badge immediately
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) })
      const previous = queryClient.getQueryData<Order>(orderKeys.detail(id))

      if (previous) {
        queryClient.setQueryData<Order>(orderKeys.detail(id), {
          ...previous,
          status,
        })
      }

      return { previous, id }
    },

    onSuccess: (order) => {
      toast.success(`Status updated to "${order.status}".`)
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },

    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.detail(context.id), context.previous)
      }
      toast.error(getErrorMessage(err, 'Failed to update order status.'))
    },
  })
}

// ─── Update payment ───────────────────────────────────────────────────────────

export function useUpdateOrderPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payment_status,
      payment_reference,
    }: {
      id: number
      payment_status: PaymentStatus
      payment_reference?: string
    }) => ordersApi.updatePayment(id, payment_status, payment_reference).then((r) => r.data.data),

    onSuccess: (order) => {
      toast.success('Payment status updated.')
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to update payment status.'))
    },
  })
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

interface UseCancelOrderOptions {
  onSuccess?: () => void
}

export function useCancelOrder({ onSuccess }: UseCancelOrderOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      ordersApi.cancel(id, reason).then((r) => r.data.data),

    onSuccess: (order) => {
      toast.success(`Order ${order.order_number} cancelled.`)
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      onSuccess?.()
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to cancel order.'))
    },
  })
}
