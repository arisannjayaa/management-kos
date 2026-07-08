<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default Super Admin Akun
        $admin = User::firstOrCreate([
            'email' => 'admin@kosmanager.local', // Domain disesuaikan
        ], [
            'id' => 'ta2e67hpatc008wc', // Tetap mempertahankan ID unik milik Anda
            'name' => 'Super Admin',
            'password' => Hash::make('password1'),
            'is_active' => true,
        ]);

        $admin->assignRole('super_admin');

        // Akun Utama Anda
        $wayan = User::firstOrCreate([
            'email' => 'wayanarisanjaya01@gmail.com',
        ], [
            'id' => 's7w9k0swo2s40oss', // Tetap mempertahankan ID unik milik Anda
            'name' => 'Super Admin',
            'password' => Hash::make('password1'),
            'is_active' => true,
        ]);

        $wayan->assignRole('super_admin');
    }
}
