<?php

namespace App\Services\RoomType;

use LaravelEasyRepository\BaseService;

interface RoomTypeService extends BaseService
{
    public function findAllByPropertyId(string $propertyId);

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
