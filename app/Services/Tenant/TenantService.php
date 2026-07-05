<?php

namespace App\Services\Tenant;

use LaravelEasyRepository\BaseService;

interface TenantService extends BaseService{

    public function allActiveByOwner($ownerId);
}
