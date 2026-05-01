<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Integration extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'store_name',
        'store_url',
        'credentials',
        'settings',
        'status',
        'last_synced_at',
        'last_error',
    ];

    protected function casts(): array
    {
        return [
            'credentials'    => 'encrypted:array',
            'settings'       => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function syncLogs(): HasMany
    {
        return $this->hasMany(IntegrationSyncLog::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function markAsError(string $error): void
    {
        $this->update([
            'status'     => 'error',
            'last_error' => $error,
        ]);
    }

    public function markAsSynced(): void
    {
        $this->update([
            'status'         => 'active',
            'last_synced_at' => now(),
            'last_error'     => null,
        ]);
    }

    public function getCredential(string $key): ?string
    {
        return $this->credentials[$key] ?? null;
    }

    public function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }
}
