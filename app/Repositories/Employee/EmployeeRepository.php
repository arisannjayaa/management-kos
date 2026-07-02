<?php

namespace App\Repositories\Employee;

use LaravelEasyRepository\Repository;

interface EmployeeRepository extends Repository{

    public function findByUserId($userId);

    public function findWithTrashed($id);

    public function restore($id);
}
