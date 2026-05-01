<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'     => 'Electronics',
                'slug'     => 'electronics',
                'children' => [
                    ['name' => 'Smartphones', 'slug' => 'smartphones'],
                    ['name' => 'Laptops',     'slug' => 'laptops'],
                    ['name' => 'Accessories', 'slug' => 'accessories'],
                ],
            ],
            [
                'name'     => 'Clothing',
                'slug'     => 'clothing',
                'children' => [
                    ['name' => 'Men',   'slug' => 'men-clothing'],
                    ['name' => 'Women', 'slug' => 'women-clothing'],
                    ['name' => 'Kids',  'slug' => 'kids-clothing'],
                ],
            ],
            [
                'name'     => 'Home & Garden',
                'slug'     => 'home-garden',
                'children' => [
                    ['name' => 'Furniture', 'slug' => 'furniture'],
                    ['name' => 'Kitchen',   'slug' => 'kitchen'],
                ],
            ],
        ];

        foreach ($categories as $data) {
            $children = $data['children'] ?? [];
            unset($data['children']);

            $parent = Category::firstOrCreate(['slug' => $data['slug']], $data);

            foreach ($children as $child) {
                Category::firstOrCreate(
                    ['slug' => $child['slug']],
                    array_merge($child, ['parent_id' => $parent->id])
                );
            }
        }

        $this->command->info('Categories seeded.');
    }
}
