<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Products
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',
            'manage-inventory',
            'view-cost-prices',

            // Orders
            'view-orders',
            'create-orders',
            'edit-orders',
            'delete-orders',
            'cancel-orders',

            // Customers
            'view-customers',
            'create-customers',
            'edit-customers',
            'delete-customers',

            // Reports
            'view-reports',
            'export-reports',

            // Users
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Messages
            'view-messages',
            'send-messages',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // Admin — full access
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $admin->syncPermissions($permissions);

        // Staff — operational access, no destructive actions or cost prices
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'api']);
        $staff->syncPermissions([
            'view-products',
            'create-products',
            'edit-products',
            'manage-inventory',
            'view-orders',
            'create-orders',
            'edit-orders',
            'cancel-orders',
            'view-customers',
            'create-customers',
            'edit-customers',
            'view-reports',
            'view-messages',
            'send-messages',
        ]);

        $this->command->info('Roles and permissions seeded.');
    }
}
