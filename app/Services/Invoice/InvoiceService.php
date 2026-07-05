<?php

namespace App\Services\Invoice;

use LaravelEasyRepository\BaseService;

interface InvoiceService extends BaseService{

    public function generateAutomaticBilling(): array;
    public function recordPayment($invoiceId, array $paymentData);
}
