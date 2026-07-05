<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'name' => $this->faker->randomElement(['Tipe Standard', 'Tipe Deluxe', 'Suite VIP Room']),
            'base_price' => $this->faker->randomElement([1200000, 1500000, 1800000, 2500000, 3500000]),
        ];
    }
}
