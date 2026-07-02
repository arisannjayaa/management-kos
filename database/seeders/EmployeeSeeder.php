<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID'); // Menggunakan locale Indonesia
        $divisions = ['sound', 'lighting', 'generator', 'led', 'rigging'];
        $soundLevels = ['Junior', 'Senior', 'Leader', 'Supervisor'];
        $statuses = ['permanent', 'contract', 'freelance'];

        // Loop untuk membuat 15 data
        for ($i = 1; $i <= 100; $i++) {

            // 1. Buat User Account terlebih dahulu
            $user = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => bcrypt('password1'), // password seragam untuk testing
                'email_verified_at' => now(),
            ]);

            // Berikan role staff (pastikan RolePermissionSeeder sudah dijalankan)
            $user->assignRole('staff');

            // 2. Tentukan Divisi secara acak
            $randomDivision = $faker->randomElement($divisions);

            // 3. Tentukan Level (jika sound gunakan soundLevels, jika tidak gunakan jabatan umum)
            $randomLevel = ($randomDivision === 'sound')
                ? $faker->randomElement($soundLevels)
                : $faker->randomElement(['Junior', 'Senior', 'Leader', 'Supervisor']);

            // 4. Buat Data Employee
            Employee::create([
                'user_id' => $user->id,
                'employee_code' => 'AGS-'.date('Y').str_pad($i, 3, '0', STR_PAD_LEFT), // AGS-2026001
                'division' => $randomDivision,
                'level' => $randomLevel,
                'address' => $faker->address(),
                'id_card_number' => $faker->creditCardNumber(),
                'status' => $faker->randomElement($statuses),
                'joined_at' => $faker->date('Y-m-d', 'now'),
                'telephone' => '081'.$faker->numerify('#########'),
            ]);
        }
    }
}
