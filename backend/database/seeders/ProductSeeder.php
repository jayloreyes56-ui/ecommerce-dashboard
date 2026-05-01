<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $smartphonesId  = Category::where('slug', 'smartphones')->value('id');
        $laptopsId      = Category::where('slug', 'laptops')->value('id');
        $accessoriesId  = Category::where('slug', 'accessories')->value('id');

        $products = [
            [
                'category_id' => $smartphonesId,
                'sku'         => 'PHN-001',
                'name'        => 'ProPhone X15',
                'description' => 'Flagship smartphone with 6.7" OLED display.',
                'price'       => 999.00,
                'cost_price'  => 620.00,
                'attributes'  => ['color' => 'Black', 'storage' => '256GB', 'ram' => '12GB'],
                'is_active'   => true,
                'is_featured' => true,
                'stock'       => 150,
            ],
            [
                'category_id' => $smartphonesId,
                'sku'         => 'PHN-002',
                'name'        => 'BudgetPhone A5',
                'description' => 'Affordable smartphone for everyday use.',
                'price'       => 299.00,
                'cost_price'  => 180.00,
                'attributes'  => ['color' => 'Blue', 'storage' => '64GB', 'ram' => '4GB'],
                'is_active'   => true,
                'is_featured' => false,
                'stock'       => 8, // Low stock
            ],
            [
                'category_id' => $laptopsId,
                'sku'         => 'LPT-001',
                'name'        => 'UltraBook Pro 14',
                'description' => '14" laptop with Intel Core i7, 16GB RAM.',
                'price'       => 1499.00,
                'cost_price'  => 950.00,
                'attributes'  => ['color' => 'Silver', 'storage' => '512GB SSD', 'ram' => '16GB'],
                'is_active'   => true,
                'is_featured' => true,
                'stock'       => 45,
            ],
            [
                'category_id' => $accessoriesId,
                'sku'         => 'ACC-001',
                'name'        => 'Wireless Charging Pad',
                'description' => '15W fast wireless charger.',
                'price'       => 39.99,
                'cost_price'  => 12.00,
                'attributes'  => ['color' => 'White', 'wattage' => '15W'],
                'is_active'   => true,
                'is_featured' => false,
                'stock'       => 200,
            ],
            [
                'category_id' => $accessoriesId,
                'sku'         => 'ACC-002',
                'name'        => 'USB-C Hub 7-in-1',
                'description' => 'Multi-port USB-C hub with HDMI, USB 3.0, SD card.',
                'price'       => 59.99,
                'cost_price'  => 22.00,
                'attributes'  => ['ports' => 7, 'color' => 'Space Gray'],
                'is_active'   => true,
                'is_featured' => false,
                'stock'       => 0, // Out of stock
            ],
        ];

        foreach ($products as $data) {
            $stock = $data['stock'];
            unset($data['stock']);

            $product = Product::firstOrCreate(['sku' => $data['sku']], $data);

            // Update inventory (created automatically via model boot)
            Inventory::where('product_id', $product->id)->update(['quantity' => $stock]);
        }

        $this->command->info('Products seeded (' . count($products) . ' products).');
    }
}
