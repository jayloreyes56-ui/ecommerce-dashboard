<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@company.com'],
            [
                'name'              => 'System Admin',
                'password'          => Hash::make('Admin@1234'),
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Staff user
        $staff = User::firstOrCreate(
            ['email' => 'staff@company.com'],
            [
                'name'              => 'Staff Member',
                'password'          => Hash::make('Staff@1234'),
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );
        $staff->assignRole('staff');

        $this->command->info('Users seeded.');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@company.com', 'Admin@1234'],
                ['Staff', 'staff@company.com', 'Staff@1234'],
            ]
        );
    }
}
