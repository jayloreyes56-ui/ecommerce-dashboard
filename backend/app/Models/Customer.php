<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'address'      => 'array',
            'total_spent'  => 'decimal:2',
            'total_orders' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, string $term)
    {
        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
        
        return $query->where(function ($q) use ($term, $operator) {
            $q->where('name', $operator, "%{$term}%")
              ->orWhere('email', $operator, "%{$term}%")
              ->orWhere('phone', $operator, "%{$term}%");
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function incrementOrderStats(float $orderTotal): void
    {
        $this->increment('total_orders');
        $this->increment('total_spent', $orderTotal);
    }

    public function decrementOrderStats(float $orderTotal): void
    {
        $this->decrement('total_orders');
        $this->decrement('total_spent', $orderTotal);
    }
}
