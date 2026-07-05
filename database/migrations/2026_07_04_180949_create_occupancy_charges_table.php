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
        Schema::create('occupancy_charges', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ringkas ke tabel induk kontrak dan master biaya
            $table->foreignUuid('occupancy_id')->constrained('occupancies')->onDelete('cascade');
            $table->foreignUuid('charge_type_id')->constrained('charge_types')->onDelete('cascade');

            // Nominal kustom khusus untuk kamar ini (Menggunakan bigInteger agar presisi rupiah)
            // Kolom dibuat nullable. Jika diisi null, sistem otomatis mengambil base_price dari charge_types.
            $table->bigInteger('amount')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupancy_charges');
    }
};
