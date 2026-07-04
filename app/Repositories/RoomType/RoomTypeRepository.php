<?php

namespace App\Repositories\RoomType;

use LaravelEasyRepository\Repository;

interface RoomTypeRepository extends Repository{

    public function getByProperty(string $propertyId);
    public function savePricingTiers(string $roomTypeId, array $tiers);

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
