<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'payment_status'   => $this->payment_status,
            'payment_method'   => $this->payment_method,
            'subtotal'         => (float) $this->subtotal,
            'discount'         => (float) $this->discount,
            'tax'              => (float) $this->tax,
            'shipping_cost'    => (float) $this->shipping_cost,
            'total'            => (float) $this->total,
            'shipping_address' => $this->shipping_address,
            'billing_address'  => $this->billing_address,
            'notes'            => $this->notes,
            'customer'         => new CustomerResource($this->whenLoaded('customer')),
            'assigned_to'      => new UserResource($this->whenLoaded('assignedTo')),
            'items'            => OrderItemResource::collection($this->whenLoaded('items')),
            'status_history'   => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'allowed_transitions' => $this->when(
                $request->user()?->can('update', $this->resource),
                fn () => \App\Models\Order::ALLOWED_TRANSITIONS[$this->status] ?? []
            ),
            'placed_at'        => $this->placed_at?->toIso8601String(),
            'confirmed_at'     => $this->confirmed_at?->toIso8601String(),
            'shipped_at'       => $this->shipped_at?->toIso8601String(),
            'delivered_at'     => $this->delivered_at?->toIso8601String(),
            'cancelled_at'     => $this->cancelled_at?->toIso8601String(),
            'created_at'       => $this->created_at->toIso8601String(),
            'updated_at'       => $this->updated_at->toIso8601String(),
        ];
    }
}
