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
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID Primary Key
            $table->string('name', 150); // Cth: "Sanjaya Kost"
            $table->text('address');
            $table->string('city', 100);
            $table->string('phone', 20);
            $table->integer('billing_cycle_days')->default(30);
            $table->integer('billing_grace_period_days')->default(0);
            $table->json('reminder_offsets_json')->nullable(); // Cth: [-3, 0, 1, 3, 7]
            $table->boolean('wa_reminder_enabled')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Relasi ke tabel users (Owner)
            $table->foreignUuid('owner_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
