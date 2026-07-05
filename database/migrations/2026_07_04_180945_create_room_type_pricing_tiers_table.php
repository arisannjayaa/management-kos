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
        Schema::create('room_type_pricing_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID Primary Key
            $table->string('name', 100); // Cth: "Tarif 1 Orang", "Tarif 2 Orang", "Harian"
            $table->decimal('price', 12, 2)->default(0); // Nominal harga untuk tier ini
            $table->timestamps();
            $table->softDeletes();

            // Hubungan relasi ke tabel induk (room_types)
            $table->foreignUuid('room_type_id')->references('id')->on('room_types')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_type_pricing_tiers');
    }
};
