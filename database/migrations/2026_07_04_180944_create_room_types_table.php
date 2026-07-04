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
        Schema::create('room_types', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID Primary Key
            $table->string('name', 100); // Cth: "Deluxe Premium", "Standard Standar"
            $table->text('description')->nullable();
            $table->decimal('base_price', 12, 2)->default(0); // Harga dasar per tipe kamar
            $table->timestamps();
            $table->softDeletes();

            // Relasi Foreign Key
            $table->foreignUuid('property_id')->references('id')->on('properties')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
