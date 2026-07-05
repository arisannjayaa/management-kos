<?php

namespace App\Repositories\ChargeType;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\ChargeType;

class ChargeTypeRepositoryImplement extends Eloquent implements ChargeTypeRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected ChargeType $model;

    public function __construct(ChargeType $model)
    {
        $this->model = $model;
    }

    // Write something awesome :)
}
