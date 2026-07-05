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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('invoice_id')->constrained('invoices')->onDelete('cascade');

            // Mencatat siapa staff/owner yang menerima dan memvalidasi pembayaran ini
            $table->foreignUuid('receiver_id')->constrained('users')->onDelete('cascade');

            $table->string('payment_number', 50)->unique(); // Format Cth: PAY/2026/07/0001
            $table->bigInteger('amount_paid');
            $table->dateTime('payment_date');

            // Metode Pembayaran & Bukti Berkas
            $table->enum('payment_method', ['cash', 'transfer'])->default('cash');
            $table->string('proof_attachment')->nullable(); // Lokasi path struk transfer (Nanti diamankan SecureFile)

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
