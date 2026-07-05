<?php

namespace App\Console\Commands;

use App\Services\Invoice\InvoiceService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:billing:generate')]
#[Description('Memeriksa siklus jatuh tempo hunian aktif dan menerbitkan invoice tagihan bulanan secara otomatis.')]
class GenerateMonthlyInvoices extends Command
{

    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        parent::__construct();
        $this->invoiceService = $invoiceService;
    }

    public function handle()
    {
        $this->info('=== MEMULAI SIKLUS GENERATOR TAGIHAN OTOMATIS ===');

        $response = $this->invoiceService->generateAutomaticBilling();

        $this->line("Tagihan Berhasil Diterbitkan: {$response['generated']} Invoice");
        $this->line("Tagihan Dilewati (Sudah Ada): {$response['skipped']} Invoice");

        $this->info('=== SIKLUS AUTOMATED BILLING ENGINE SELESAI ===');

        return Command::SUCCESS;
    }
}
