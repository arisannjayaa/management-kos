<?php

namespace Database\Seeders;

use App\Models\ChargeMeterReading;
use App\Models\ChargeType;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Invoice;
use App\Models\Occupancy;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KosManagementSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== SINKRONISASI AKUN AKTOR (MULTI-ROLE) ===');

        // A. AKUN: SUPER ADMIN
        $superAdmin = User::where('email', 'admin@kosmanager.com')->first() ?? User::factory()->create([
            'name' => 'Super Admin KosManager',
            'email' => 'admin@kosmanager.com',
            'password' => bcrypt('password'),
        ]);
        $superAdmin->assignRole('super_admin');

        // B. AKUN: OWNER UTAMA (Bli Ari Sanjaya)
        $owner = User::where('email', 'owner@kosmanager.com')->first() ?? User::factory()->create([
            'name' => 'Bli Ari Sanjaya',
            'email' => 'owner@kosmanager.com',
            'password' => bcrypt('password'),
        ]);
        $owner->assignRole('owner');

        // C. AKUN: STAFF OPERASIONAL / PENJAGA KOS
        $staff = User::where('email', 'staff@kosmanager.com')->first() ?? User::factory()->create([
            'name' => 'Wayan Penjaga Kos',
            'email' => 'staff@kosmanager.com',
            'password' => bcrypt('password'),
        ]);
        $staff->assignRole('staff');

        // D. AKUN: USER PORTAL TENANT
        $tenantUser = User::where('email', 'tenant@kosmanager.com')->first() ?? User::factory()->create([
            'name' => 'Made Penyewa Eksklusif',
            'email' => 'tenant@kosmanager.com',
            'password' => bcrypt('password'),
        ]);
        $tenantUser->assignRole('tenant');

        /*
        |--------------------------------------------------------------------------
        | MASTER GENERATOR: PROPERTI, UNIT KAMAR & OPERASIONAL METERAN
        |--------------------------------------------------------------------------
        */
        $this->command->info('=== MEMBUAT DATA MASTER GEDUNG KOS & KONTRAK HUNI ===');

        $properties = Property::factory(2)->create(['owner_id' => $owner->id]);
        $tenants = Tenant::factory(12)->create(['owner_id' => $owner->id]);
        $tenantIndex = 0;

        /*
        |--------------------------------------------------------------------------
        | MASTER GENERATOR: KATEGORI PENGELUARAN (BIAYA OPERASIONAL)
        |--------------------------------------------------------------------------
        */
        $expenseCategories = [
            ['name' => 'Listrik Induk (Fasum)', 'description' => 'Tagihan listrik PLN untuk area umum dan pompa air.'],
            ['name' => 'Pemeliharaan Bangunan', 'description' => 'Perbaikan keran bocor, cat mengelupas, ganti lampu, dll.'],
            ['name' => 'Iuran Banjar / Desa Adat', 'description' => 'Iuran bulanan adat, keamanan, dan kebersihan lingkungan desa.'],
            ['name' => 'Gaji Staff', 'description' => 'Gaji bulanan penjaga kos dan petugas kebersihan.'],
        ];

        $createdExpenseCategories = [];
        foreach ($expenseCategories as $categoryData) {
            $createdExpenseCategories[] = ExpenseCategory::create([
                'owner_id' => $owner->id,
                'name' => $categoryData['name'],
                'description' => $categoryData['description'],
            ]);
        }

        foreach ($properties as $property) {
            // Master beban khusus per gedung
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

            $flatChargeInstances = [];
            $meteredChargeInstances = [];

            foreach ($feeTemplates as $fee) {
                $chargeType = ChargeType::create($fee);
                if ($fee['billing_method'] === 'flat') {
                    $flatChargeInstances[] = $chargeType;
                } else {
                    $meteredChargeInstances[] = $chargeType;
                }
            }

            $roomTypes = RoomType::factory(3)->create(['property_id' => $property->id]);

            foreach ($roomTypes as $type) {
                $rooms = Room::factory(5)->create([
                    'property_id' => $property->id,
                    'room_type_id' => $type->id,
                    'status' => 'available',
                ]);

                $occupiedRooms = $rooms->random(2);

                foreach ($occupiedRooms as $room) {
                    if (isset($tenants[$tenantIndex])) {
                        $currentTenant = $tenants[$tenantIndex];

                        // Set check-in sebulan lalu dengan siklus jatuh tempo HARI INI
                        $occupancy = Occupancy::create([
                            'property_id' => $property->id,
                            'room_id' => $room->id,
                            'room_type_id' => $type->id,
                            'tenant_id' => $currentTenant->id,
                            'price' => $type->base_price,
                            'billing_day' => now()->day,
                            'status' => 'active',
                            'start_date' => now()->subMonth()->format('Y-m-d'),
                        ]);

                        foreach ($flatChargeInstances as $flatCharge) {
                            $occupancy->occupancyCharges()->create([
                                'charge_type_id' => $flatCharge->id,
                                'amount' => null,
                            ]);
                        }

                        foreach ($meteredChargeInstances as $meteredCharge) {
                            $occupancy->occupancyCharges()->create([
                                'charge_type_id' => $meteredCharge->id,
                                'amount' => null,
                            ]);

                            // Catat log stan meteran awal keliling lapangan
                            $previousReading = rand(100, 200);
                            $currentReading = $previousReading + rand(80, 150);
                            $usage = $currentReading - $previousReading;
                            $amount = $usage * (float) $meteredCharge->unit_price;

                            ChargeMeterReading::create([
                                'occupancy_id' => $occupancy->id,
                                'charge_type_id' => $meteredCharge->id,
                                'previous_reading' => $previousReading,
                                'current_reading' => $currentReading,
                                'usage' => $usage,
                                'amount' => $amount,
                                'reading_date' => now()->format('Y-m-d'),
                                'invoice_id' => null,
                            ]);
                        }

                        $room->update(['status' => 'occupied']);
                        $tenantIndex++;
                    }
                }

                $maintenanceRoom = $rooms->where('status', 'available')->random();
                $maintenanceRoom->update(['status' => 'maintenance']);
            }

            // SIMULASI PENGELUARAN OPERASIONAL (EXPENSE) PER GEDUNG KOS
            for ($i = 0; $i < rand(3, 6); $i++) {
                $randomCategory = $createdExpenseCategories[array_rand($createdExpenseCategories)];

                Expense::create([
                    'property_id' => $property->id,
                    'expense_category_id' => $randomCategory->id,
                    'amount' => rand(2, 15) * 50000, // Nominal acak kelipatan 50.000
                    'expense_date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                    'notes' => 'Catatan operasional harian untuk '.strtolower($randomCategory->name),
                    'receipt_attachment' => null,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | AUTOMATED BILLING SYNC RUNNER (FASE 5)
        |--------------------------------------------------------------------------
        */
        $this->command->newLine();
        $this->command->info('=== TRIGER: AUTOMATED INVOICE ENGINE GENERATOR ===');

        // Memanggil Artisan Command yang mengawinkan data pokok + biaya flat + log meteran utilitas
        $this->command->call('app:billing:generate');

        /*
        |--------------------------------------------------------------------------
        | CASHIER SIMULATION LEDGER SEEDING (KUITANSI MASUK)
        |--------------------------------------------------------------------------
        */
        $this->command->newLine();
        $this->command->info('=== SIMULASI PEMBUKUAN KASIR: MERAKIT VARIASI KUITANSI ===');

        $generatedInvoices = Invoice::all();
        $paySequence = 1;

        foreach ($generatedInvoices as $index => $invoice) {
            // Skenario 1: Kelompok Invoice Lunas (Status: Paid via Tunai/Cash)
            if ($index % 4 === 0) {
                $payNumber = 'PAY/'.now()->format('Y/m').'/'.str_pad($paySequence++, 4, '0', STR_PAD_LEFT);

                Payment::create([
                    'invoice_id' => $invoice->id,
                    'receiver_id' => $staff->id, // Diterima oleh staff operasional kos
                    'payment_number' => $payNumber,
                    'amount_paid' => $invoice->final_amount,
                    'payment_date' => now(),
                    'payment_method' => 'cash',
                    'notes' => 'Pembayaran lunas uang kos titip tunai lewat staff jaga.',
                ]);

                $invoice->update([
                    'paid_amount' => $invoice->final_amount,
                    'status' => 'paid',
                ]);
            } // Skenario 2: Kelompok Invoice Dicicil Sebagian (Status: Partially Paid via Transfer)
            elseif ($index % 4 === 1) {
                $payNumber = 'PAY/'.now()->format('Y/m').'/'.str_pad($paySequence++, 4, '0', STR_PAD_LEFT);
                $halfAmount = round($invoice->final_amount / 2);

                Payment::create([
                    'invoice_id' => $invoice->id,
                    'receiver_id' => $owner->id, // Divalidasi langsung oleh owner Bli Ari
                    'payment_number' => $payNumber,
                    'amount_paid' => $halfAmount,
                    'payment_date' => now()->subHours(2),
                    'payment_method' => 'transfer',
                    'proof_attachment' => 'attachments/payments/sample_struk.jpg', // Simulasi file struk bank masuk
                    'notes' => 'Cicilan pertama via transfer Mandiri, pelunasan dijanjikan akhir minggu.',
                ]);

                $invoice->update([
                    'paid_amount' => $halfAmount,
                    'status' => 'partially_paid',
                ]);
            } // Skenario 3: Kelompok Invoice Dibatalkan / Salah Input (Status: Void)
            elseif ($index % 4 === 2) {
                $invoice->update([
                    'status' => 'void',
                    'notes' => 'Dibatalkan otomatis oleh Owner karena ada koreksi selisih angka meteran.',
                ]);
            }

            // Skenario 4: Sisa kelompok dibiarkan 'unpaid' (Belum Bayar) tanpa kuitansi untuk menguji fungsi tombol bayar
        }

        $this->command->info('=== SELURUH DATA PEMBUKUAN KASIR BERHASIL DISINKRONKAN SEMPURNA ===');
    }
}
