<?php

namespace App\Repositories\Invoice;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Invoice;

class InvoiceRepositoryImplement extends Eloquent implements InvoiceRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected Invoice $model;

    public function __construct(Invoice $model)
    {
        $this->model = $model;
    }

    // Write something awesome :)
}
