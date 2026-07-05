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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke induk invoice
            $table->foreignUuid('invoice_id')->constrained('invoices')->onDelete('cascade');

            // Detail Komponen Biaya
            $table->string('name'); // Cth: "Sewa Kamar Fisik Pokok", "Iuran Air & Sampah", "Biaya Listrik Token"
            $table->integer('qty')->default(1);
            $table->bigInteger('price'); // Harga satuan komponen
            $table->bigInteger('subtotal'); // Hasil kalkulasi (qty * price)

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
