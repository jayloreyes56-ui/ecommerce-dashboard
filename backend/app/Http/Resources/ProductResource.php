<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'sku'             => $this->sku,
            'name'            => $this->name,
            'description'     => $this->description,
            'price'           => (float) $this->price,
            'cost_price'      => $this->when(
                $request->user()?->can('view-cost-prices'),
                fn () => (float) $this->cost_price
            ),
            'compare_price'   => $this->compare_price ? (float) $this->compare_price : null,
            'profit_margin'   => $this->when(
                $request->user()?->can('view-cost-prices'),
                fn () => $this->profit_margin
            ),
            'attributes'      => $this->attributes ?? [],
            'images'          => $this->images ?? [],
            'is_active'       => $this->is_active,
            'is_featured'     => $this->is_featured,
            'category'        => new CategoryResource($this->whenLoaded('category')),
            'inventory'       => new InventoryResource($this->whenLoaded('inventory')),
            'available_stock' => $this->when(
                $this->relationLoaded('inventory'),
                fn () => $this->available_stock
            ),
            'created_at'      => $this->created_at->toIso8601String(),
            'updated_at'      => $this->updated_at->toIso8601String(),
        ];
    }
}
