<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'name'    => 'Alice Johnson',
                'email'   => 'alice@example.com',
                'phone'   => '+1-555-0101',
                'address' => [
                    'street'  => '123 Main St',
                    'city'    => 'New York',
                    'state'   => 'NY',
                    'zip'     => '10001',
                    'country' => 'US',
                ],
            ],
            [
                'name'    => 'Bob Martinez',
                'email'   => 'bob@example.com',
                'phone'   => '+1-555-0102',
                'address' => [
                    'street'  => '456 Oak Ave',
                    'city'    => 'Los Angeles',
                    'state'   => 'CA',
                    'zip'     => '90001',
                    'country' => 'US',
                ],
            ],
            [
                'name'    => 'Carol White',
                'email'   => 'carol@example.com',
                'phone'   => '+1-555-0103',
                'address' => [
                    'street'  => '789 Pine Rd',
                    'city'    => 'Chicago',
                    'state'   => 'IL',
                    'zip'     => '60601',
                    'country' => 'US',
                ],
            ],
            [
                'name'    => 'David Lee',
                'email'   => 'david@example.com',
                'phone'   => '+44-20-7946-0958',
                'address' => [
                    'street'  => '10 Downing St',
                    'city'    => 'London',
                    'country' => 'GB',
                ],
            ],
        ];

        foreach ($customers as $data) {
            Customer::firstOrCreate(['email' => $data['email']], $data);
        }

        $this->command->info('Customers seeded.');
    }
}
