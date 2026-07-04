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
        Schema::create('charge_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('property_id');
            $table->string('name', 100);
            $table->enum('billing_method', ['flat', 'metered', 'per_occupant']);
            $table->decimal('default_amount', 12, 2)->nullable();
            $table->string('unit_label', 20)->nullable();
            $table->decimal('unit_price', 12, 2)->nullable();
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
        Schema::dropIfExists('charge_types');
    }
};
