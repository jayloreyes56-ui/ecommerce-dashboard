<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'address'      => $this->address,
            'status'       => $this->status,
            'total_orders' => $this->total_orders,
            'total_spent'  => (float) $this->total_spent,
            'notes'        => $this->notes,
            'orders'       => OrderResource::collection($this->whenLoaded('orders')),
            'created_at'   => $this->created_at->toIso8601String(),
        ];
    }
}
