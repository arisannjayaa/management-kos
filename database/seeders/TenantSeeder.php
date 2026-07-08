<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = User::firstOrCreate([
            'email' => 'tenant@kosmanager.com',
        ], [
            'name' => 'Tenant',
            'password' => Hash::make('password1'),
            'is_active' => true,
        ]);

        $tenant->assignRole('tenant');
    }
}
