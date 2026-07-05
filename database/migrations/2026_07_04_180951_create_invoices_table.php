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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi constraints hulu operasional kos
            $table->foreignUuid('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignUuid('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignUuid('occupancy_id')->constrained('occupancies')->onDelete('cascade');

            // Parameter Identitas Tagihan
            $table->string('invoice_number', 50)->unique(); // Format Cth: INV/2026/07/0001
            $table->date('period_start');
            $table->date('period_end');
            $table->date('due_date');

            // Finansial Parameter (Menggunakan bigInteger demi presisi mata uang rupiah)
            $table->bigInteger('amount');
            $table->bigInteger('discount_amount')->default(0);
            $table->bigInteger('final_amount'); // Total bersih yang wajib dibayar (amount - discount)
            $table->bigInteger('paid_amount')->default(0); // Akumulasi cicilan yang sudah masuk

            // Status Siklus Pembayaran
            $table->enum('status', ['unpaid', 'partially_paid', 'paid', 'void'])->default('unpaid');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Mendukung keranjang sampah finansial
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
