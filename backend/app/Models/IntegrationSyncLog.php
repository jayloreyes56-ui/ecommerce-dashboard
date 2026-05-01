<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationSyncLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'integration_id',
        'direction',
        'entity',
        'total',
        'success',
        'failed',
        'errors',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'total'       => 'integer',
            'success'     => 'integer',
            'failed'      => 'integer',
            'errors'      => 'array',
            'started_at'  => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function markAsFinished(): void
    {
        $this->update(['finished_at' => now()]);
    }

    public function incrementSuccess(): void
    {
        $this->increment('success');
    }

    public function incrementFailed(string $error): void
    {
        $this->increment('failed');
        
        $errors = $this->errors ?? [];
        $errors[] = $error;
        
        $this->update(['errors' => $errors]);
    }

    public function getDuration(): ?int
    {
        if (!$this->finished_at) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->finished_at);
    }

    public function getSuccessRate(): float
    {
        if ($this->total === 0) {
            return 0;
        }

        return round(($this->success / $this->total) * 100, 2);
    }
}
