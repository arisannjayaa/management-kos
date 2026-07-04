<?php

namespace App\Repositories\WaSession;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\WaSession;

class WaSessionRepositoryImplement extends Eloquent implements WaSessionRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected WaSession $model;

    public function __construct(WaSession $model)
    {
        $this->model = $model;
    }

    // Write something awesome :)
}
