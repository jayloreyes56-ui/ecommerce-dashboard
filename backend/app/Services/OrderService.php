<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly ProductService $productService
    ) {}

    /**
     * Paginated order list with filters.
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return Order::query()
            ->with(['customer', 'items', 'assignedTo'])
            ->when(isset($filters['search']), fn ($q) => $q->search($filters['search']))
            ->when(isset($filters['status']), fn ($q) => $q->byStatus($filters['status']))
            ->when(isset($filters['payment_status']), fn ($q) => $q->where('payment_status', $filters['payment_status']))
            ->when(isset($filters['customer_id']), fn ($q) => $q->where('customer_id', $filters['customer_id']))
            ->when(isset($filters['from']) || isset($filters['to']), fn ($q) => $q->dateRange($filters['from'] ?? null, $filters['to'] ?? null))
            ->orderBy($filters['sort_by'] ?? 'placed_at', $filters['sort_dir'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 25);
    }

    /**
     * Create a new order with items, inventory reservation, and customer stats update.
     */
    public function create(array $data, User $createdBy): Order
    {
        return DB::transaction(function () use ($data, $createdBy) {
            // Validate and price all items
            $items = $this->resolveOrderItems($data['items']);

            $subtotal = collect($items)->sum('total_price');
            $discount = $data['discount'] ?? 0;
            $tax      = $data['tax'] ?? 0;
            $shipping = $data['shipping_cost'] ?? 0;
            $total    = $subtotal - $discount + $tax + $shipping;

            // Create the order
            $order = Order::create([
                'customer_id'      => $data['customer_id'],
                'assigned_to'      => $data['assigned_to'] ?? null,
                'status'           => Order::STATUS_PENDING,
                'payment_status'   => Order::PAYMENT_UNPAID,
                'payment_method'   => $data['payment_method'] ?? null,
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'tax'              => $tax,
                'shipping_cost'    => $shipping,
                'total'            => $total,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address'  => $data['billing_address'] ?? null,
                'notes'            => $data['notes'] ?? null,
            ]);

            // Create order items
            foreach ($items as $item) {
                $order->items()->create($item);
            }

            // Reserve inventory for each product
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                $this->productService->reserveStock($product, $item['quantity']);
            }

            // Record initial status history
            OrderStatusHistory::create([
                'order_id'   => $order->id,
                'changed_by' => $createdBy->id,
                'from_status' => null,
                'to_status'  => Order::STATUS_PENDING,
                'note'       => 'Order created',
            ]);

            // Update customer stats
            Customer::find($data['customer_id'])->incrementOrderStats($total);

            return $order->load(['customer', 'items.product', 'statusHistory.changedBy']);
        });
    }

    /**
     * Transition order to a new status with validation.
     */
    public function updateStatus(Order $order, string $newStatus, User $changedBy, ?string $note = null): Order
    {
        if (! $order->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition order from [{$order->status}] to [{$newStatus}]."
            );
        }

        return DB::transaction(function () use ($order, $newStatus, $changedBy, $note) {
            $oldStatus = $order->status;

            $timestamps = $this->getStatusTimestamp($newStatus);

            $order->update(array_merge(['status' => $newStatus], $timestamps));

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $changedBy->id,
                'from_status' => $oldStatus,
                'to_status'   => $newStatus,
                'note'        => $note,
            ]);

            // Handle inventory on status change
            $this->handleInventoryOnStatusChange($order, $oldStatus, $newStatus);

            return $order->fresh(['customer', 'items', 'statusHistory.changedBy']);
        });
    }

    /**
     * Update order payment status.
     */
    public function updatePayment(Order $order, string $paymentStatus, ?string $reference = null): Order
    {
        $order->update([
            'payment_status'    => $paymentStatus,
            'payment_reference' => $reference ?? $order->payment_reference,
        ]);

        return $order->fresh();
    }

    /**
     * Cancel an order and release inventory.
     */
    public function cancel(Order $order, User $cancelledBy, string $reason): Order
    {
        if (! $order->isCancellable()) {
            throw new \InvalidArgumentException(
                "Order [{$order->order_number}] cannot be cancelled in its current status [{$order->status}]."
            );
        }

        return $this->updateStatus($order, Order::STATUS_CANCELLED, $cancelledBy, $reason);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function resolveOrderItems(array $rawItems): array
    {
        $items = [];

        foreach ($rawItems as $raw) {
            $product = Product::findOrFail($raw['product_id']);

            if (! $product->is_active) {
                throw new \RuntimeException("Product [{$product->sku}] is not available.");
            }

            $totalPrice = $product->price * $raw['quantity'];

            $items[] = [
                'product_id'       => $product->id,
                'product_name'     => $product->name,
                'product_sku'      => $product->sku,
                'quantity'         => $raw['quantity'],
                'unit_price'       => $product->price,
                'total_price'      => $totalPrice,
                'product_snapshot' => [
                    'id'         => $product->id,
                    'name'       => $product->name,
                    'sku'        => $product->sku,
                    'price'      => $product->price,
                    'attributes' => $product->attributes,
                ],
            ];
        }

        return $items;
    }

    private function getStatusTimestamp(string $status): array
    {
        return match ($status) {
            Order::STATUS_CONFIRMED  => ['confirmed_at' => now()],
            Order::STATUS_SHIPPED    => ['shipped_at' => now()],
            Order::STATUS_DELIVERED  => ['delivered_at' => now()],
            Order::STATUS_CANCELLED  => ['cancelled_at' => now()],
            default                  => [],
        };
    }

    private function handleInventoryOnStatusChange(Order $order, string $from, string $to): void
    {
        // When confirmed: deduct actual stock and release reservation
        if ($to === Order::STATUS_CONFIRMED) {
            foreach ($order->items as $item) {
                $product = $item->product;
                // Deduct from quantity
                $this->productService->adjustStock(
                    product: $product,
                    change: -$item->quantity,
                    reason: 'sale',
                    note: "Order {$order->order_number} confirmed",
                    orderId: $order->id
                );
                // Release reservation
                $this->productService->releaseReservation($product, $item->quantity);
            }
        }

        // When cancelled: release reservation (stock was never deducted if still pending)
        if ($to === Order::STATUS_CANCELLED && $from === Order::STATUS_PENDING) {
            foreach ($order->items as $item) {
                $this->productService->releaseReservation($item->product, $item->quantity);
            }
        }

        // When refunded: return stock
        if ($to === Order::STATUS_REFUNDED) {
            foreach ($order->items as $item) {
                $this->productService->adjustStock(
                    product: $item->product,
                    change: $item->quantity,
                    reason: 'return',
                    note: "Order {$order->order_number} refunded",
                    orderId: $order->id
                );
            }
        }
    }
}
