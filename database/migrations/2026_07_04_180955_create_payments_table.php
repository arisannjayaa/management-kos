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
            $table->foreignUuid('receiver_id')->constrained('users'); // Staff/Owner penerima dana
            $table->string('payment_number')->unique(); // Format kuitansi: PAY/YYYY/MM/0001
            $table->decimal('amount_paid', 14, 2); // Nominal setoran masukan
            $table->dateTime('payment_date');
            $table->string('payment_method')->default('cash'); // cash, transfer
            $table->string('proof_attachment')->nullable(); // Path struk transfer biner
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Dukungan keranjang sampah kuitansi
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
