<?php

namespace App\Repositories\Tenant;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Tenant;

class TenantRepositoryImplement extends Eloquent implements TenantRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected Tenant $model;

    public function __construct(Tenant $model)
    {
        $this->model = $model;
    }

    // Mengambil semua tenant milik owner yang login
    public function getByOwner($ownerId)
    {
        return $this->model->where('owner_id', $ownerId)->orderBy('name', 'asc')->get();
    }
}
