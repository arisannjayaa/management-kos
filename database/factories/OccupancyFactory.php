<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class OccupancyFactory extends Factory
{
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-3 months', 'now');
        $carbonStart = Carbon::parse($startDate);

        return [
            'property_id' => Property::factory(),
            'room_id' => Room::factory(),
            'room_type_id' => RoomType::factory(),
            'tenant_id' => Tenant::factory(),
            'room_type_pricing_tier_id' => null, // Default null tanpa tier kustom

            'start_date' => $carbonStart->format('Y-m-d'),
            'end_date' => null, // Berjalan aktif rutin bulanan
            'billing_day' => $carbonStart->day, // Auto ikuti tanggal masuk huni

            'price' => 1500000, // Akan di-override nilainya secara dinamis di Seeder
            'deposit_amount' => $this->faker->randomElement([500000, 1000000, 0]),
            'status' => 'active',
        ];
    }
}
