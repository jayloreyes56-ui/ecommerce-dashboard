<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'description',
        'price',
        'cost_price',
        'compare_price',
        'attributes',
        'images',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price'         => 'decimal:2',
            'cost_price'    => 'decimal:2',
            'compare_price' => 'decimal:2',
            'attributes'    => 'array',
            'images'        => 'array',
            'is_active'     => 'boolean',
            'is_featured'   => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch($query, string $term)
    {
        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
        
        return $query->where(function ($q) use ($term, $operator) {
            $q->where('name', $operator, "%{$term}%")
              ->orWhere('sku', $operator, "%{$term}%")
              ->orWhere('description', $operator, "%{$term}%");
        });
    }

    public function scopeLowStock($query)
    {
        return $query->whereHas('inventory', function ($q) {
            $q->whereRaw('quantity <= low_stock_threshold');
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function getAvailableStockAttribute(): int
    {
        return max(0, ($this->inventory?->quantity ?? 0) - ($this->inventory?->reserved ?? 0));
    }

    public function getProfitMarginAttribute(): ?float
    {
        if (! $this->cost_price || $this->cost_price == 0) {
            return null;
        }

        return round((($this->price - $this->cost_price) / $this->price) * 100, 2);
    }

    // ─── Hooks ────────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::created(function (Product $product) {
            // Auto-create inventory record on product creation
            $product->inventory()->create([
                'quantity'  => 0,
                'reserved'  => 0,
            ]);
        });
    }
}
