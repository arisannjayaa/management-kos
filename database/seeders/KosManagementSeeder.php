<?php

namespace Database\Seeders;

use App\Models\ChargeType;
use App\Models\Occupancy;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Tenant;
use App\Models\User; // 🌟 IMPORT MODEL MASTER BIAYA
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KosManagementSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Amankan akun target Owner penguji utama
        $owner = User::where('email', 'owner@kosmanager.com')->first();

        if (! $owner) {
            $owner = User::factory()->create([
                'name' => 'Bli Ari Sanjaya',
                'email' => 'owner@kosmanager.test',
                'password' => bcrypt('password'),
            ]);
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

            // 🌟 SINKRONISASI BLUEPRINT: Buat master beban biaya khusus untuk gedung ini
            $feeTemplates = [
                [
                    'id' => Str::uuid()->toString(),
                    'property_id' => $property->id,
                    'name' => 'Iuran Air & Sampah',
                    'billing_method' => 'flat',
                    'default_amount' => 25000,
                    'is_active' => true,
                ],
                [
                    'id' => Str::uuid()->toString(),
                    'property_id' => $property->id,
                    'name' => 'Internet WiFi High-Speed',
                    'billing_method' => 'flat',
                    'default_amount' => 50000,
                    'is_active' => true,
                ],
                [
                    'id' => Str::uuid()->toString(),
                    'property_id' => $property->id,
                    'name' => 'Listrik (Kamar Meteran)',
                    'billing_method' => 'metered',
                    'unit_label' => 'kWh',
                    'unit_price' => 2000,
                    'is_active' => true,
                ],
            ];

            // Simpan instance biaya bertipe flat untuk otomatis ditempel ke kontrak hunian di bawah
            $flatChargeInstances = [];
            foreach ($feeTemplates as $fee) {
                $chargeType = ChargeType::create($fee);
                if ($fee['billing_method'] === 'flat') {
                    $flatChargeInstances[] = $chargeType;
                }
            }

            // Pembuatan 3 tipe kamar berbeda di setiap gedung kos
            $roomTypes = RoomType::factory(3)->create([
                'property_id' => $property->id,
            ]);

            foreach ($roomTypes as $type) {
                // Buat 5 unit kamar fisik untuk masing-masing tipe kamar
                $rooms = Room::factory(5)->create([
                    'property_id' => $property->id,
                    'room_type_id' => $type->id,
                    'status' => 'available',
                ]);

                // Kita buat skenario huni: Ambil 2 kamar secara acak untuk di-isi (Check-In)
                $occupiedRooms = $rooms->random(2);

                foreach ($occupiedRooms as $room) {
                    if (isset($tenants[$tenantIndex])) {
                        $currentTenant = $tenants[$tenantIndex];

                        // Eksekusi pembuatan log kontrak hunian aktif (Check-In)
                        $occupancy = Occupancy::create([
                            'property_id' => $property->id,
                            'room_id' => $room->id,
                            'room_type_id' => $type->id,
                            'tenant_id' => $currentTenant->id,
                            'price' => $type->base_price,
                            'billing_day' => now()->day, // Kunci siklus tagihan jatuh di tanggal hari ini
                            'status' => 'active',
                            'start_date' => now()->subMonth()->format('Y-m-d'), // Set sebulan lalu agar valid ditagih hari ini
                        ]);

                        // 🌟 KUNCI LOGIKA BARU: Pasangkan langsung paket biaya iuran tambahan ke kontrak sewa ini
                        foreach ($flatChargeInstances as $flatCharge) {
                            $occupancy->occupancyCharges()->create([
                                'charge_type_id' => $flatCharge->id,
                                'amount' => null, // Null artinya otomatis mengambil nilai 'default_amount' bawaan master biaya
                            ]);
                        }

                        // AUTOMATION SYNC STATE: Balik status kamar fisik menjadi terisi ('occupied')
                        $room->update(['status' => 'occupied']);

                        $tenantIndex++;
                    }
                }

                // Beri variasi: Ambil 1 kamar secara acak untuk diset sedang rusak/perbaikan
                $maintenanceRoom = $rooms->where('status', 'available')->random();
                $maintenanceRoom->update(['status' => 'maintenance']);
            }
        }

//        // TRIGGER AUTOMATED BILLING GENERATOR DI AKHIR SEEDER
//        $this->command->newLine();
//        $this->command->info('=== MEMICU GENERATOR INVOICE FINANSIAL DARI SEEDER ===');
//        $this->command->call('billing:generate');
//        $this->command->info('=== SELURUH DATA REKAPAN AWAL BERHASIL DISINKRONKAN ===');
    }
}
