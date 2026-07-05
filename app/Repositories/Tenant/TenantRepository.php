<?php

namespace App\Repositories\Tenant;

use LaravelEasyRepository\Repository;

interface TenantRepository extends Repository{

    public function getByOwner($ownerId);
}
