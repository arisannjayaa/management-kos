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
        /*
        |--------------------------------------------------------------------------
        | Reset Cache
        |--------------------------------------------------------------------------
        */

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Permissions (Format: resource.action)
        |--------------------------------------------------------------------------
        */

        $permissions = [
            // Utama & Sistem
            'dashboard.view',
            'audit_logs.view',
            'system_settings.manage',

            // Manajemen Kos
            'property.view', 'property.create', 'property.update', 'property.delete',
            'room.view', 'room.create', 'room.update', 'room.delete',
            'room_type.view', 'room_type.create', 'room_type.update', 'room_type.delete',
            'tenant.view', 'tenant.create', 'tenant.update', 'tenant.delete',

            // Okupansi & Tagihan
            'occupancy.view', 'occupancy.create', 'occupancy.checkout', 'occupancy.delete',
            'charge_type.view', 'charge_type.create', 'charge_type.update', 'charge_type.delete',
            'meter_reading.create',

            // Keuangan (Invoice & Payment)
            'invoice.view', 'invoice.void', 'invoice.generate-manual',
            'payment.view', 'payment.create', 'payment.delete',

            // Pengeluaran / Operasional (Fitur Baru v2.0)
            'expense_category.view', 'expense_category.create', 'expense_category.update', 'expense_category.delete',
            'expense.view', 'expense.create', 'expense.update', 'expense.delete',
            'report.view',

            // Komplain
            'complaint.view', 'complaint.create', 'complaint.update', 'complaint.delete',

            // Master Data & Users
            'staff.manage',
            'role.manage',

            // Khusus Tenant (Portal)
            'invoice.view-own',
            'payment.view-own',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Roles & Permission Assignments
        |--------------------------------------------------------------------------
        */

        // 1. Super Admin: Mendapatkan seluruh akses
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // 2. Owner: Mendapatkan semua akses KECUALI yang khusus Tenant
        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->syncPermissions(Permission::all()->reject(function ($p) {
            return in_array($p->name, ['invoice.view-own', 'payment.view-own', 'complaint.create']);
        }));

        // 3. Staff / Penjaga Kos: Mendapatkan sebagian akses operasional harian
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions([
            'dashboard.view',
            'room.view',
            'occupancy.view', 'occupancy.create', 'occupancy.checkout',
            'invoice.view',
            'payment.view', 'payment.create', // Perhatikan: payment.delete tidak diberikan
            'meter_reading.create',
            'expense.view', 'expense.create', // Perhatikan: expense.update/delete tidak diberikan
            'complaint.view', 'complaint.update',
        ]);

        // 4. Tenant
        $tenant = Role::firstOrCreate(['name' => 'tenant', 'guard_name' => 'web']);
        $tenant->syncPermissions([
            'invoice.view-own',
            'payment.view-own',
            'complaint.create',
            'complaint.view',
        ]);
    }
}
