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
        | Reset Cache Keamanan Spatie
        |--------------------------------------------------------------------------
        */
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Permissions Blueprint (Format: resource.action)
        |--------------------------------------------------------------------------
        */
        $permissions = [
            // Utama & Sistem
            'dashboard.view',
            'audit_logs.view',
            'system_settings.manage',

            // Manajemen Properti Kos
            'property.view', 'property.create', 'property.update', 'property.delete',
            'room.view', 'room.create', 'room.update', 'room.delete',
            'room_type.view', 'room_type.create', 'room_type.update', 'room_type.delete',
            'tenant.view', 'tenant.create', 'tenant.update', 'tenant.delete',

            // Okupansi Kontrak & Tagihan Master
            'occupancy.view', 'occupancy.create', 'occupancy.checkout', 'occupancy.delete',
            'charge_type.view', 'charge_type.create', 'charge_type.update', 'charge_type.delete',

            // 🌟 SYNC FASE 4: OPERASIONAL OPERASI METERAN DIGITAL UTUH
            'meter_reading.view', 'meter_reading.create', 'meter_reading.update', 'meter_reading.delete',

            // Keuangan Kasir (Invoice & Payment)
            'invoice.view', 'invoice.void', 'invoice.generate-manual', 'invoice.pay', // 🔒 FIXED: Duplikasi invoice.pay sudah dibersihkan
            'payment.view', 'payment.create', 'payment.delete',

            // Pengeluaran / Buku Operasional (Kebutuhan Fase 6)
            'expense_category.view', 'expense_category.create', 'expense_category.update', 'expense_category.delete',
            'expense.view', 'expense.create', 'expense.update', 'expense.delete',
            'report.view',

            // Komplain / Keluhan Penghuni
            'complaint.view', 'complaint.create', 'complaint.update', 'complaint.delete',

            // Pengelolaan Struktur Tim & Pengguna
            'staff.manage',
            'role.manage',

            // Khusus Kamar Mandiri Tenant (Portal Tenant Bypass)
            'invoice.view-own',
            'payment.view-own',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Roles & Permission Assignments Mapping
        |--------------------------------------------------------------------------
        */

        // 1. ROLE: SUPER ADMIN (Otoritas Penuh Sistem)
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // 2. ROLE: OWNER (Aktor Utama Bisnis Kos)
        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->syncPermissions(Permission::all()->reject(function ($p) {
            // 🔒 REVISI UTAMA: Mengeluarkan 'invoice.pay' dari list reject agar Owner bisa terima uang sewa!
            return in_array($p->name, [
                'invoice.view-own',
                'payment.view-own',
                'complaint.create',
            ]);
        }));

        // 3. ROLE: STAFF / PENJAGA KOS (Pelaksana Lapangan Terbatas)
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions([
            'dashboard.view',

            // 🌟 SEKARANG STAFF BISA MELIHAT MASTER KOS UNTUK KEPERLUAN OPERASIONAL
            'property.view',
            'room_type.view',
            'room.view',
            'tenant.view',

            // Operasional Kontrak & Kamar (Bisa Check-In / Check-Out tapi tidak bisa hapus)
            'occupancy.view', 'occupancy.create', 'occupancy.checkout',

            'invoice.view',
            'invoice.pay',
            'payment.view', 'payment.create',

            // 🌟 OPERASIONAL LAPANGAN: Keliling catat angka stan meteran air/listrik kos harian
            'meter_reading.view', 'meter_reading.create',

            'expense.view', 'expense.create',
            'complaint.view', 'complaint.update',
        ]);

        // 4. ROLE: TENANT (Portal Mandiri Penghuni Kamar Kos)
        $tenant = Role::firstOrCreate(['name' => 'tenant', 'guard_name' => 'web']);
        $tenant->syncPermissions([
            'invoice.view-own',
            'payment.view-own',
            'complaint.create',
            'complaint.view',
        ]);
    }
}
