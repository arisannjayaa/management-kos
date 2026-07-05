<?php

namespace App\Services\Occupancy;

use LaravelEasyRepository\BaseService;

interface OccupancyService extends BaseService
{
    public function checkOut($id, array $closureData);

    public function findActiveByProperty($propertyId);

    public function checkIn(array $data);
}
