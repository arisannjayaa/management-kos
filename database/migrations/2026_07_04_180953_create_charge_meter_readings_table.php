<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('charge_meter_readings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi Kontrak Okupansi & Jenis Biaya (Metered)
            $table->foreignUuid('occupancy_id')->constrained('occupancies')->onDelete('cascade');
            $table->foreignUuid('charge_type_id')->constrained('charge_types')->onDelete('cascade');

            // Angka Indikator Meteran
            $table->decimal('previous_reading', 12, 2)->default(0);
            $table->decimal('current_reading', 12, 2);
            $table->decimal('usage', 12, 2); // Otomatisasi selisih (current - previous)
            $table->decimal('amount', 12, 2); // Hasil hitung final rupiah (usage * unit_price master)

            $table->date('reading_date');

            // Pengunci Invoice: Nullable saat dicatat rutin, akan terisi ID Invoice saat tagihan bulan berjalan terbit
            $table->foreignUuid('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charge_meter_readings');
    }
};
