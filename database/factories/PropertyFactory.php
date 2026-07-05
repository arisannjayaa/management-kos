<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->randomElement(['Kos ', 'Griya ', 'Residence ', 'Home ']).$this->faker->firstName(),
            'city' => $this->faker->randomElement(['Denpasar', 'Badung', 'Gianyar', 'Tabanan']),

            // 🌟 TAMBAHKAN KOLOM-KOLOM WAJIB INI AGAR TIDAK ERROR
            'address' => $this->faker->address(),
            'phone' => $this->faker->numerify('081##########'),

            // Kolom finansial & reminder otomatis (sesuaikan jika nama kolom di migrasi Anda agak berbeda)
            'billing_cycle_days' => 30,
            'billing_grace_period_days' => 0,
            'wa_reminder_enabled' => true,

            'is_active' => '1',
        ];
    }
}
