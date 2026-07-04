<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = User::firstOrCreate([
            'email' => 'owner@kosmanager.com',
        ], [
            'name' => 'Ari Sanjaya',
            'password' => Hash::make('password1'),
            'is_active' => true,
        ]);

        $owner->assignRole('owner');
    }
}
