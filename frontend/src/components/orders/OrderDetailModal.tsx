import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Truck } from 'lucide-react'
import { useOrder, useUpdateOrderStatus, useCancelOrder } from '@/hooks/useOrders'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import {
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  orderId: number
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  confirmed:  CheckCircle,
  processing: Clock,
  shipped:    Truck,
  delivered:  CheckCircle,
  cancelled:  XCircle,
}

export function OrderDetailModal({ open, onClose, orderId }: Props) {
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelInput, setShowCancelInput] = useState(false)

  const { data: order, isLoading } = useOrder(orderId, open)
  const statusMutation = useUpdateOrderStatus()
  const cancelMutation = useCancelOrder({ onSuccess: () => setShowCancelInput(false) })

  return (
    <Modal open={open} onClose={onClose} title="Order Details" size="xl">
      {isLoading || !order ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold text-gray-900">{order.order_number}</p>
              <p className="text-sm text-gray-500">{formatDateTime(order.placed_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} config={ORDER_STATUS_CONFIG} />
              <StatusBadge status={order.payment_status} config={PAYMENT_STATUS_CONFIG} />
            </div>
          </div>

          {/* Status Actions */}
          {order.allowed_transitions && order.allowed_transitions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {order.allowed_transitions.map((status) => {
                  const Icon = STATUS_ICONS[status]
                  const cfg = ORDER_STATUS_CONFIG[status]
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      icon={Icon ? <Icon className="h-3.5 w-3.5" /> : undefined}
                      loading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: orderId, status })}
                    >
                      {cfg?.label ?? status}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancel section */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'refunded' && (
            <div>
              {showCancelInput ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="Reason for cancellation…"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelMutation.isPending}
                    onClick={() => cancelReason && cancelMutation.mutate({ id: orderId, reason: cancelReason })}
                  >
                    Confirm Cancel
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCancelInput(false)}>
                    Back
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancelInput(true)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer */}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-sm text-gray-500">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-sm text-gray-500">{order.customer.phone}</p>
              )}
            </div>

            {/* Shipping */}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Shipping Address
              </p>
              {order.shipping_address ? (
                <div className="text-sm text-gray-700">
                  <p>{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  <p>{order.shipping_address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No shipping address</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Order Items
            </p>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                    <p className="text-xs text-gray-400">
                      SKU: {item.product_sku} · Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              {[
                { label: 'Subtotal',  value: order.subtotal },
                { label: 'Discount',  value: -order.discount },
                { label: 'Tax',       value: order.tax },
                { label: 'Shipping',  value: order.shipping_cost },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-gray-600">
                  <span>{label}</span>
                  <span>{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status History
              </p>
              <div className="space-y-2">
                {order.status_history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {ORDER_STATUS_CONFIG[h.to_status]?.label ?? h.to_status}
                      </span>
                      {h.note && <span className="ml-2 text-gray-500">— {h.note}</span>}
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatDateTime(h.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
