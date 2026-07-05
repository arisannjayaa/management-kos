<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->name(),
            'ktp_number' => $this->faker->numerify('5103##############'),
            'ktp_attachment' => null, // Biarkan null untuk testing default opsional
            'phone' => $this->faker->numerify('081##########'), // Format WA Indonesia umum
            'emergency_contact' => $this->faker->numerify('0819########'),
            'status' => 'active',
        ];
    }
}
