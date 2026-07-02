<?php

namespace App\Services\Employee;

use LaravelEasyRepository\BaseService;

interface EmployeeService extends BaseService{

    public function restore($id);

    public function findByUserId($userId);
}
