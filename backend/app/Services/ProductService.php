<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    /**
     * Paginated product list with filters.
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category', 'inventory'])
            ->when(isset($filters['search']), fn ($q) => $q->search($filters['search']))
            ->when(isset($filters['category_id']), fn ($q) => $q->where('category_id', $filters['category_id']))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', $filters['is_active']))
            ->when(isset($filters['low_stock']) && $filters['low_stock'], fn ($q) => $q->lowStock())
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 25);
    }

    /**
     * Create product with initial inventory.
     */
    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create($data);

            // Inventory is auto-created via model boot hook.
            // Set initial stock if provided.
            if (isset($data['initial_stock']) && $data['initial_stock'] > 0) {
                $this->adjustStock(
                    product: $product,
                    change: $data['initial_stock'],
                    reason: 'restock',
                    note: 'Initial stock on product creation',
                    user: auth()->user()
                );
            }

            return $product->load(['category', 'inventory']);
        });
    }

    /**
     * Update product details.
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['category', 'inventory']);
    }

    /**
     * Delete product (soft delete, blocks if has active orders).
     */
    public function delete(Product $product): void
    {
        $activeOrderCount = $product->orderItems()
            ->whereHas('order', fn ($q) => $q->whereNotIn('status', ['delivered', 'cancelled', 'refunded']))
            ->count();

        if ($activeOrderCount > 0) {
            throw new \RuntimeException('Cannot delete a product with active orders.');
        }

        $product->delete();
    }

    /**
     * Adjust inventory stock with full audit trail.
     */
    public function adjustStock(
        Product $product,
        int $change,
        string $reason,
        ?string $note = null,
        ?User $user = null,
        ?int $orderId = null
    ): Inventory {
        return DB::transaction(function () use ($product, $change, $reason, $note, $user, $orderId) {
            // Lock the row to prevent race conditions
            $inventory = Inventory::where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $newQuantity = $inventory->quantity + $change;

            if ($newQuantity < 0) {
                throw new \RuntimeException(
                    "Insufficient stock for product [{$product->sku}]. Available: {$inventory->quantity}, Requested: " . abs($change)
                );
            }

            $inventory->update([
                'quantity'   => $newQuantity,
                'updated_at' => now(),
            ]);

            InventoryLog::create([
                'product_id'     => $product->id,
                'user_id'        => $user?->id,
                'order_id'       => $orderId,
                'change'         => $change,
                'quantity_after' => $newQuantity,
                'reason'         => $reason,
                'note'           => $note,
            ]);

            return $inventory->fresh();
        });
    }

    /**
     * Reserve stock for a pending order (does not reduce quantity).
     */
    public function reserveStock(Product $product, int $quantity): void
    {
        DB::transaction(function () use ($product, $quantity) {
            $inventory = Inventory::where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($inventory->available < $quantity) {
                throw new \RuntimeException(
                    "Cannot reserve {$quantity} units of [{$product->sku}]. Available: {$inventory->available}"
                );
            }

            $inventory->increment('reserved', $quantity);
        });
    }

    /**
     * Release reserved stock (e.g., on order cancellation).
     */
    public function releaseReservation(Product $product, int $quantity): void
    {
        Inventory::where('product_id', $product->id)
            ->decrement('reserved', min($quantity, DB::table('inventory')->where('product_id', $product->id)->value('reserved')));
    }

    /**
     * Upload product images to storage.
     */
    public function uploadImages(Product $product, array $files): Product
    {
        $images = $product->images ?? [];

        foreach ($files as $file) {
            $path = $file->store("products/{$product->id}", 's3');
            $images[] = [
                'url'  => Storage::disk('s3')->url($path),
                'path' => $path,
            ];
        }

        $product->update(['images' => $images]);

        return $product->fresh();
    }
}
