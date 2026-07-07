<?php

namespace App\Repositories\ExpenseCategory;

use LaravelEasyRepository\Repository;

interface ExpenseCategoryRepository extends Repository{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
