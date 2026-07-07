<?php

namespace App\Services\ExpenseCategory;

use LaravelEasyRepository\BaseService;

interface ExpenseCategoryService extends BaseService{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
