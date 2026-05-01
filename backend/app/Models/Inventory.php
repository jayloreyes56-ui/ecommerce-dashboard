<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    public $timestamps = false;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'quantity',
        'reserved',
        'low_stock_threshold',
    ];

    protected function casts(): array
    {
        return [
            'quantity'            => 'integer',
            'reserved'            => 'integer',
            'low_stock_threshold' => 'integer',
            'updated_at'          => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class, 'product_id', 'product_id');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function getAvailableAttribute(): int
    {
        return max(0, $this->quantity - $this->reserved);
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->low_stock_threshold;
    }

    public function isOutOfStock(): bool
    {
        return $this->available <= 0;
    }
}
