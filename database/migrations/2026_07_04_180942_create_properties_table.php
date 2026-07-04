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
            $table->uuid('id')->primary();
            $table->string('owner_id', 36);
            $table->string('name', 150);
            $table->text('address');
            $table->string('city', 100);
            $table->string('phone', 20);
            $table->integer('billing_cycle_days')->default(30);
            $table->integer('billing_grace_period_days')->default(0);
            $table->json('reminder_offsets_json')->nullable();
            $table->boolean('wa_reminder_enabled')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
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
