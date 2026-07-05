<?php

namespace Database\Seeders;

use App\Models\Occupancy;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class KosManagementSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Amankan akun target Owner penguji utama (sesuaikan email dengan user login Anda)
        $owner = User::where('email', 'owner@kosmanager.com')->first();

        if (! $owner) {
            $owner = User::factory()->create([
                'name' => 'Bli Ari Sanjaya',
                'email' => 'owner@kosmanager.test',
                'password' => bcrypt('password'),
            ]);
            // Jika menggunakan Spatie Laravel-Permission, pasang role owner di sini:
            // $owner->assignRole('owner');
        }

        // 2. Tembak pembuatan 2 Gedung Properti Kos palsu
        $properties = Property::factory(2)->create([
            'owner_id' => $owner->id,
        ]);

        // 3. Gandeng pembuatan Tenant (Penyewa) terdaftar sebanyak 12 orang
        $tenants = Tenant::factory(12)->create([
            'owner_id' => $owner->id,
        ]);

        $tenantIndex = 0;

        foreach ($properties as $property) {
            // Pembuatan 3 tipe kamar berbeda di setiap gedung kos
            $roomTypes = RoomType::factory(3)->create([
                'property_id' => $property->id,
            ]);

            foreach ($roomTypes as $type) {
                // Buat 5 unit kamar fisik untuk masing-masing tipe kamar
                $rooms = Room::factory(5)->create([
                    'property_id' => $property->id,
                    'room_type_id' => $type->id,
                    'status' => 'available', // Set awal semua ready kosong
                ]);

                // Kita buat skenario huni: Ambil 2 kamar secara acak untuk di-isi (Check-In)
                $occupiedRooms = $rooms->random(2);

                foreach ($occupiedRooms as $room) {
                    // Pastikan stok tenant penguji masih ada sebelum dipasangkan
                    if (isset($tenants[$tenantIndex])) {
                        $currentTenant = $tenants[$tenantIndex];

                        // Eksekusi pembuatan log kontrak hunian aktif (Check-In)
                        Occupancy::factory()->create([
                            'property_id' => $property->id,
                            'room_id' => $room->id,
                            'room_type_id' => $type->id,
                            'tenant_id' => $currentTenant->id,
                            'price' => $type->base_price, // Kunci harga sesuai tipe kamar deal pokok
                            'status' => 'active',
                        ]);

                        // 🌟 AUTOMATION SYNC STATE: Balik status kamar fisik menjadi terisi ('occupied')
                        $room->update(['status' => 'occupied']);

                        $tenantIndex++; // Maju ke urutan tenant berikutnya
                    }
                }

                // Beri variasi: Ambil 1 kamar secara acak untuk diset sedang rusak/perbaikan
                $maintenanceRoom = $rooms->where('status', 'available')->random();
                $maintenanceRoom->update(['status' => 'maintenance']);
            }
        }
    }
}
