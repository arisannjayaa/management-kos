<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // Pondasi Role
            EmployeeSeeder::class,       // Data Pegawai Fake
        ]);

        $admin = User::factory()->create([
            'name' => 'Ari',
            'email' => 'admin@mail.com',
            'password' => bcrypt('password1'),
        ]);


        $admin->assignRole('administrator');
    }
}
