<?php

namespace App\Services\ChargeType;

use LaravelEasyRepository\ServiceApi;
use App\Repositories\ChargeType\ChargeTypeRepository;

class ChargeTypeServiceImplement extends ServiceApi implements ChargeTypeService{

    /**
     * set title message api for CRUD
     * @param string $title
     */
     protected string $title = "Master Komponen Biaya";
     /**
     * uncomment this to override the default message
     * protected string $create_message = "";
     * protected string $update_message = "";
     * protected string $delete_message = "";
     */

     /**
     * don't change $this->mainRepository variable name
     * because used in extends service class
     */
     protected ChargeTypeRepository $mainRepository;

    public function __construct(ChargeTypeRepository $mainRepository)
    {
      $this->mainRepository = $mainRepository;
    }

    // Define your custom methods :)
}
