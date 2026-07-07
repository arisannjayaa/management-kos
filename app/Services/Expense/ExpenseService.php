<?php

namespace App\Services\Expense;

use LaravelEasyRepository\BaseService;

interface ExpenseService extends BaseService{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
