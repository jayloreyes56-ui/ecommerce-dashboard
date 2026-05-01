<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductService();
    }

    public function test_can_create_product_with_initial_stock(): void
    {
        $data = [
            'sku' => 'TEST-001',
            'name' => 'Test Product',
            'price' => 99.99,
            'initial_stock' => 50,
        ];

        $product = $this->service->create($data);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals('TEST-001', $product->sku);
        $this->assertNotNull($product->inventory);
        $this->assertEquals(50, $product->inventory->quantity);
    }

    public function test_adjust_stock_creates_log_entry(): void
    {
        $product = Product::factory()->create();
        $user = \App\Models\User::factory()->create();

        $inventory = $this->service->adjustStock(
            product: $product,
            change: 100,
            reason: 'restock',
            note: 'Test restock',
            user: $user
        );

        $this->assertEquals(100, $inventory->quantity);
        
        $this->assertDatabaseHas('inventory_logs', [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'change' => 100,
            'quantity_after' => 100,
            'reason' => 'restock',
        ]);
    }

    public function test_cannot_adjust_stock_below_zero(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Insufficient stock');

        $product = Product::factory()->create();

        $this->service->adjustStock(
            product: $product,
            change: -100,
            reason: 'sale',
            note: 'Test sale'
        );
    }

    public function test_cannot_delete_product_with_active_orders(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot delete a product with active orders');

        $product = Product::factory()->create();
        
        // Create an active order with this product
        $order = \App\Models\Order::factory()->create(['status' => 'pending']);
        \App\Models\OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ]);

        $this->service->delete($product);
    }

    public function test_can_delete_product_without_active_orders(): void
    {
        $product = Product::factory()->create();

        $this->service->delete($product);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }
}
