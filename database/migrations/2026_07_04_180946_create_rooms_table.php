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
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID Primary Key
            $table->string('room_number', 50); // Cth: "A1", "B10"
            $table->string('status', 30)->default('available'); // available, occupied, maintenance
            $table->timestamps();
            $table->softDeletes();

            // Relasi Foreign Keys
            $table->foreignUuid('property_id')->references('id')->on('properties')->cascadeOnDelete();
            $table->foreignUuid('room_type_id')->references('id')->on('room_types')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
