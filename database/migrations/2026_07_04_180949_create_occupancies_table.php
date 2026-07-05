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
        Schema::create('occupancies', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi constraints UUID hulu
            $table->foreignUuid('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignUuid('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignUuid('room_type_id')->constrained('room_types')->onDelete('cascade');
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');

            // Pilihan opsional jika sewa menggunakan kustom skema tarif berjenjang (pricing tiers)
            $table->foreignUuid('room_type_pricing_tier_id')
                ->nullable()
                ->constrained('room_type_pricing_tiers')
                ->onDelete('set null');

            $table->date('start_date');
            $table->date('end_date')->nullable(); // Nullable jika sewa bersifat bulanan terus-menerus

            $table->unsignedInteger('billing_day'); // Menyimpan tanggal siklus tagihan rutin (Cth: tanggal 5)

            // Mengunci parameter finansial saat check-in
            $table->bigInteger('price');
            $table->bigInteger('deposit_amount')->default(0)->nullable(); // Jaminan awal masuk

            $table->enum('status', ['active', 'checked_out'])->default('active');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupancies');
    }
};
