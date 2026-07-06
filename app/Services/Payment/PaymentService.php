<?php

namespace App\Services\Payment;

use LaravelEasyRepository\BaseService;

interface PaymentService extends BaseService{

    public function annulPayment($id): mixed;
    public function bulkAnnul(array $ids): mixed;
}
