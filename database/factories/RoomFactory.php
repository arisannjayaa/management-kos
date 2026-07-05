<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'room_type_id' => RoomType::factory(),
            // Membuat kode kamar acak seperti 102, 204, 301
            'room_number' => $this->faker->numberBetween(1, 3).'0'.$this->faker->numberBetween(1, 9),
            'status' => 'available', // Default diset kosong, nanti diubah via seeder jika terisi
        ];
    }
}
