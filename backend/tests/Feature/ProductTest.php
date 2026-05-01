<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->staff = User::factory()->create();
        $this->staff->assignRole('staff');
    }

    public function test_admin_can_list_products(): void
    {
        Product::factory()->count(5)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'sku', 'price', 'is_active'],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }

    public function test_admin_can_create_product(): void
    {
        $category = Category::factory()->create();

        $productData = [
            'category_id' => $category->id,
            'sku' => 'TEST-001',
            'name' => 'Test Product',
            'description' => 'Test description',
            'price' => 99.99,
            'cost_price' => 50.00,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'sku' => 'TEST-001',
                    'name' => 'Test Product',
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'sku' => 'TEST-001',
            'name' => 'Test Product',
        ]);

        // Verify inventory was auto-created
        $product = Product::where('sku', 'TEST-001')->first();
        $this->assertNotNull($product->inventory);
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'New Name',
                'price' => 199.99,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'New Name',
        ]);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }

    public function test_staff_cannot_delete_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->staff, 'sanctum')
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(403);
    }

    public function test_can_search_products(): void
    {
        Product::factory()->create(['name' => 'iPhone 15']);
        Product::factory()->create(['name' => 'Samsung Galaxy']);
        Product::factory()->create(['name' => 'iPhone 14']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/products?search=iPhone');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
        $this->assertTrue(
            collect($data)->every(fn($p) => str_contains($p['name'], 'iPhone'))
        );
    }

    public function test_can_adjust_product_stock(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/products/{$product->id}/stock", [
                'change' => 100,
                'reason' => 'restock',
                'note' => 'Initial stock',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('inventory', [
            'product_id' => $product->id,
            'quantity' => 100,
        ]);

        $this->assertDatabaseHas('inventory_logs', [
            'product_id' => $product->id,
            'change' => 100,
            'reason' => 'restock',
        ]);
    }

    public function test_bulk_delete_products(): void
    {
        $products = Product::factory()->count(3)->create();
        $ids = $products->pluck('id')->toArray();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/products/bulk-delete', [
                'ids' => $ids,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'deleted' => 3,
                    'failed' => 0,
                ],
            ]);

        foreach ($ids as $id) {
            $this->assertSoftDeleted('products', ['id' => $id]);
        }
    }
}
