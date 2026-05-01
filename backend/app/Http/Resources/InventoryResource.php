<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'quantity'            => $this->quantity,
            'reserved'            => $this->reserved,
            'available'           => $this->available,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_low_stock'        => $this->isLowStock(),
            'is_out_of_stock'     => $this->isOutOfStock(),
            'updated_at'          => $this->updated_at?->toIso8601String(),
        ];
    }
}
