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

            // 🌟 SYNC FASE 4: OPERASIONAL METERAN DIGITAL
            'meter_reading.view', 'meter_reading.create', 'meter_reading.update', 'meter_reading.delete',

            // 🔒 FIXED FASE 6: Pengeluaran Buku Operasional (Duplikasi Sudah Dibersihkan)
            'expense_category.view', 'expense_category.create', 'expense_category.update', 'expense_category.delete',
            'expense.view', 'expense.create', 'expense.update', 'expense.delete',

            // Keuangan Kasir & Analitik (Invoice, Payment & Fase 7)
            'invoice.view', 'invoice.void', 'invoice.generate-manual', 'invoice.pay',
            'payment.view', 'payment.create', 'payment.delete',
            'report.view', // Untuk akses Dasbor Grafik & Cetak PDF Keuangan

            // 🌟 SYNC FASE 8: Komplain / Keluhan Penghuni Kos
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
            // Owner memegang semua kendali kecuali bypass portal milik Tenant mandiri
            return in_array($p->name, [
                'role.manage',
                'invoice.view-own',
                'payment.view-own',
                'complaint.create', // Kamar komplain hanya dibuat oleh Tenant pelapor
            ]);
        }));

        // 3. ROLE: STAFF / PENJAGA KOS (Pelaksana Lapangan Terbatas)
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions([
            'dashboard.view',

            // Otoritas Baca Data Master untuk Operasional Kasir & Lapangan
            'property.view',
            'room_type.view',
            'room.view',
            'tenant.view',

            // Operasional Kontrak Kamar
            'occupancy.view', 'occupancy.create', 'occupancy.checkout',

            // Modul Keuangan & Pembayaran Sewa
            'invoice.view',
            'invoice.pay',
            'payment.view', 'payment.create',
            'report.view', // 🌟 SINKRONISASI FASE 7: Staff kini diizinkan melihat dasbor laporan keuangan Owner

            // Modul Utilitas & Keliling Meteran
            'meter_reading.view', 'meter_reading.create',

            // Modul Operasional Pengeluaran (Fase 6)
            'expense_category.view', // 🌟 SINKRONISASI FASE 6: Staff bisa baca master kategori agar dropdown form tidak kosong
            'expense.view', 'expense.create', // Staff boleh mencatat pengeluaran operasional lapangan

            // Modul Keluhan Kamar Kos (Fase 8)
            'complaint.view', 'complaint.update', // Staff bisa memantau aduan dan mengubah status perkembangan tiket
        ]);

        // 4. ROLE: TENANT (Portal Mandiri Penghuni Kamar Kos)
        $tenant = Role::firstOrCreate(['name' => 'tenant', 'guard_name' => 'web']);
        $tenant->syncPermissions([
            'dashboard.view',
            'invoice.view-own',
            'payment.view-own',
            'complaint.create', // Tenant berhak mengajukan keluhan baru
            'complaint.view',   // Tenant berhak memantau progress perbaikan kamarnya sendiri
        ]);
    }
}
