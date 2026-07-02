<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Permissions by Module
        $modules = [
            'user' => ['view', 'create', 'edit', 'delete'],
            'customer' => ['view', 'create', 'edit', 'delete'],
            'transaction' => ['view', 'create', 'void', 'approve'],
            'inventory' => ['view', 'manage', 'adjust'],
            'report' => ['view-financial', 'view-inventory'],
        ];

        $allPermissions = [];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissionName = "{$action}-{$module}";
                Permission::create(['name' => $permissionName]);
                $allPermissions[] = $permissionName;
            }
        }

        // 2. Create Roles and Assign Permissions

        // Administrator: Can do everything
        $admin = Role::create(['name' => 'administrator']);
        $admin->givePermissionTo(Permission::all());

        // Manager: High level access but maybe no user deletion
        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view-user', 'view-customer', 'edit-customer',
            'view-transaction', 'approve-transaction',
            'view-inventory', 'manage-inventory',
            'view-financial-report',
        ]);

        // Staff: Operational only
        $staff = Role::create(['name' => 'staff']);
        $staff->givePermissionTo([
            'view-customer', 'create-customer',
            'view-transaction', 'create-transaction',
            'view-inventory',
        ]);
    }
}
