<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Debt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DebtFactory extends Factory
{
    protected $model = Debt::class;

    public function definition(): array
    {
        // 1. Tetapkan nominal kelipatan agar rapi di pembukuan
        $amount = $this->faker->randomElement([500000, 1000000, 1500000, 2000000, 3000000, 5000000]);

        // 2. Tentukan skema metode pengembalian dana pembukuan
        $paymentMethod = $this->faker->randomElement(['lump_sum', 'installment']);

        // 3. Buat variasi acak status kelunasan awal
        $status = $this->faker->randomElement(['unpaid', 'partial', 'paid']);

        // 4. Hitung sisa saldo berjalan secara proporsional agar aman bagi database seeder
        $remainingAmount = match ($status) {
            'paid' => 0,
            'partial' => (int) ($amount * $this->faker->randomElement([0.25, 0.50, 0.75])), // Pecahan proporsional dari pokok
            'unpaid' => $amount,
        };

        // 5. Probabilitas penanda sirkulasi dana titipan transit (20% kemungkinan)
        $isDeposit = $this->faker->boolean(20);

        // Jika dana titipan aktif, paksa skema ke sekali bayar (Lump Sum) sesuai regulasi sistem
        if ($isDeposit) {
            $paymentMethod = 'lump_sum';
        }

        // 6. Siasati pembagian tanggal jatuh tempo adaptif skema
        $dueDate = null;
        if ($paymentMethod === 'installment') {
            // Skema berkala wajib memiliki baseline tenggat awal
            $dueDate = $this->faker->dateTimeBetween('now', '+3 months')?->format('Y-m-d');
        } else {
            // Skema sekali bayar (Lump Sum / Dana Talangan) diperbolehkan kosong (null) sebesar 40% probabilitas
            $dueDate = $this->faker->boolean(60)
                ? $this->faker->dateTimeBetween('now', '+2 months')?->format('Y-m-d')
                : null;
        }

        return [
            'user_id'             => User::inRandomOrder()->first()?->id ?? User::factory(),
            'category_id'         => $isDeposit ? null : (Category::inRandomOrder()->first()?->id ?? Category::factory()),
            'transaction_id'      => null, // Diisi lewat trigger action manual / testing Service

            'contact_name'        => $this->faker->name(),
            'type'                => $this->faker->randomElement(['debt', 'receivables']),
            'payment_method'      => $paymentMethod, // 🌟 Kolom arsitektur baru pembukuan

            'amount'              => $amount,
            'remaining_amount'    => $remainingAmount,
            'status'              => $status,

            'is_deposit'          => $isDeposit,
            'deposit_target_name' => $isDeposit ? 'Mitra ' . $this->faker->name() : null, // Menggunakan penamaan general

            'description'         => $this->faker->optional(70)->sentence(),
            'due_date'            => $dueDate,

            'created_at'          => $this->faker->dateTimeBetween('-3 months', 'now'),
            'updated_at'          => now(),
        ];
    }
}
