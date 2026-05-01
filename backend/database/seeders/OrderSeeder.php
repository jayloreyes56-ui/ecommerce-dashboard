<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $admin    = User::role('admin')->first();
        $customer = Customer::where('email', 'alice@example.com')->first();
        $product1 = Product::where('sku', 'PHN-001')->first();
        $product2 = Product::where('sku', 'ACC-001')->first();

        if (! $customer || ! $product1) {
            $this->command->warn('Run CustomerSeeder and ProductSeeder first.');
            return;
        }

        // Sample delivered order
        $order = Order::create([
            'customer_id'    => $customer->id,
            'status'         => Order::STATUS_DELIVERED,
            'payment_status' => Order::PAYMENT_PAID,
            'payment_method' => 'credit_card',
            'subtotal'       => 1038.99,
            'discount'       => 0,
            'tax'            => 83.12,
            'shipping_cost'  => 9.99,
            'total'          => 1132.10,
            'shipping_address' => $customer->address,
            'placed_at'      => now()->subDays(10),
            'confirmed_at'   => now()->subDays(9),
            'shipped_at'     => now()->subDays(7),
            'delivered_at'   => now()->subDays(5),
        ]);

        OrderItem::create([
            'order_id'     => $order->id,
            'product_id'   => $product1->id,
            'product_name' => $product1->name,
            'product_sku'  => $product1->sku,
            'quantity'     => 1,
            'unit_price'   => 999.00,
            'total_price'  => 999.00,
        ]);

        OrderItem::create([
            'order_id'     => $order->id,
            'product_id'   => $product2->id,
            'product_name' => $product2->name,
            'product_sku'  => $product2->sku,
            'quantity'     => 1,
            'unit_price'   => 39.99,
            'total_price'  => 39.99,
        ]);

        // Status history
        foreach ([
            [null, 'pending', 'Order placed'],
            ['pending', 'confirmed', 'Payment verified'],
            ['confirmed', 'processing', 'Preparing shipment'],
            ['processing', 'shipped', 'Shipped via FedEx #123456'],
            ['shipped', 'delivered', 'Delivered to customer'],
        ] as [$from, $to, $note]) {
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $admin->id,
                'from_status' => $from,
                'to_status'   => $to,
                'note'        => $note,
            ]);
        }

        // Update customer stats
        $customer->incrementOrderStats($order->total);

        // Sample pending order
        $customer2 = Customer::where('email', 'bob@example.com')->first();
        if ($customer2) {
            $pendingOrder = Order::create([
                'customer_id'    => $customer2->id,
                'status'         => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_UNPAID,
                'subtotal'       => 1499.00,
                'discount'       => 0,
                'tax'            => 119.92,
                'shipping_cost'  => 0,
                'total'          => 1618.92,
                'placed_at'      => now()->subHours(2),
            ]);

            $laptop = Product::where('sku', 'LPT-001')->first();
            if ($laptop) {
                OrderItem::create([
                    'order_id'     => $pendingOrder->id,
                    'product_id'   => $laptop->id,
                    'product_name' => $laptop->name,
                    'product_sku'  => $laptop->sku,
                    'quantity'     => 1,
                    'unit_price'   => 1499.00,
                    'total_price'  => 1499.00,
                ]);
            }

            OrderStatusHistory::create([
                'order_id'   => $pendingOrder->id,
                'changed_by' => $admin->id,
                'to_status'  => Order::STATUS_PENDING,
                'note'       => 'Order placed',
            ]);

            $customer2->incrementOrderStats($pendingOrder->total);
        }

        $this->command->info('Sample orders seeded.');
    }
}
