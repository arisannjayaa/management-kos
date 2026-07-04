<?php

namespace App\Repositories\Debt;

use LaravelEasyRepository\Repository;

interface DebtRepository extends Repository{

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
