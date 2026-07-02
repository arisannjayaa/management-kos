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
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_code')->unique();

            $table->enum('division', ['sound', 'lighting', 'generator', 'led', 'rigging']);
            $table->string('level');
            $table->string('address');
            $table->string('id_card_number');

            $table->enum('status', ['permanent', 'contract', 'freelance'])->default('freelance');
            $table->date('joined_at');
            $table->string('telephone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee');
    }
};
