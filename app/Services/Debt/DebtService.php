<?php

namespace App\Services\Debt;

use LaravelEasyRepository\BaseService;

interface DebtService extends BaseService{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
