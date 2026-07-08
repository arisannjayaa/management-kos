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
        Schema::create('complaints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('property_id')->references('id')->on('properties')->cascadeOnDelete();
            $table->foreignUuid('room_id')->references('id')->on('rooms')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();

            $table->string('title');
            $table->text('description');
            $table->string('attachment')->nullable(); // Foto bukti kerusakan/keluhan
            $table->string('status')->default('pending'); // pending, processing, resolved, rejected
            $table->text('response_notes')->nullable(); // Catatan tanggapan dari staff/owner

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
