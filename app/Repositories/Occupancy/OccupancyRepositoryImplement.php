<?php

namespace App\Repositories\Occupancy;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Occupancy;

class OccupancyRepositoryImplement extends Eloquent implements OccupancyRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected Occupancy $model;

    public function __construct(Occupancy $model)
    {
        $this->model = $model;
    }

    /**
     * Implementasi method pencarian kontrak aktif per properti kos
     */
    public function getActiveByProperty($propertyId)
    {
        return $this->model->with(['room', 'tenant', 'roomType'])
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->get();
    }
}
