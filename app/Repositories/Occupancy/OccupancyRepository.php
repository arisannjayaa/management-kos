<?php

namespace App\Repositories\Occupancy;

use LaravelEasyRepository\Repository;

interface OccupancyRepository extends Repository{

    public function getActiveByProperty($propertyId);
}
