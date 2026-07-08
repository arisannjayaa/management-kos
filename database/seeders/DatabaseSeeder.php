<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. SEEDER WAJIB: Akan selalu dijalankan di semua environment (termasuk Production)
        $this->call([
            RolePermissionSeeder::class, // Jika Anda pakai spatie/permission
            AdminSeeder::class, // Contoh: Seeder untuk akun Admin
            OwnerSeeder::class,
            StaffSeeder::class,
            TenantSeeder::class,
            KosManagementSeeder::class,
        ]);

        // 2. SEEDER DUMMY: Hanya dijalankan jika BUKAN di environment 'production'
        if (! app()->environment('production')) {
            $this->call([
            ]);

            $this->command->info('Environment Local/Staging terdeteksi. Data contoh (dummy) berhasil ditambahkan.');
        } else {
            $this->command->warn('Environment Production terdeteksi! Seeder data contoh (dummy) dilewati.');
        }
    }
}
