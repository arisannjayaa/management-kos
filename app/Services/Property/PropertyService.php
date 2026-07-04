<?php

namespace App\Services\Property;

use LaravelEasyRepository\BaseService;

interface PropertyService extends BaseService{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
    public function findAllByOwnerId(string $ownerId);
}
