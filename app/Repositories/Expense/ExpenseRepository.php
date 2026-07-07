<?php

namespace App\Repositories\Expense;

use LaravelEasyRepository\Repository;

interface ExpenseRepository extends Repository{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
